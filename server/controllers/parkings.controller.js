/**
 * @desc    Create new parking booking
 * @route   POST /api/parkings/bookings
 * @access  Private
 */
exports.createParkingBooking = async (req, res) => {
  try {
    const { 
      parkingId,
      parkingSpotId,
      bookingType, 
      startTime, 
      endTime,
      vehicleType,
      vehicleNumber,
      paymentMethod 
    } = req.body;

    console.log('Creating parking booking for user:', req.user.id, 'parking:', parkingId);

    // Check if parking exists
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      return res.status(404).json({
        success: false,
        message: 'Parking not found'
      });
    }

    // Check if parking spot exists and is available
    let parkingSpot;
    if (parkingSpotId) {
      parkingSpot = await ParkingSpot.findById(parkingSpotId);
      
      if (!parkingSpot) {
        return res.status(404).json({
          success: false,
          message: 'Parking spot not found'
        });
      }
      
      if (parkingSpot.status !== 'available') {
        return res.status(400).json({
          success: false,
          message: 'Parking spot is not available'
        });
      }
    } else {
      // Find an available parking spot based on vehicle type
      parkingSpot = await ParkingSpot.findOne({
        parkingId: parkingId,
        status: 'available',
        vehicleTypesAccepted: vehicleType,
        isDisabled: false
      });
      
      if (!parkingSpot) {
        return res.status(400).json({
          success: false,
          message: 'No available parking spots for the selected vehicle type'
        });
      }
    }

    // Check for time conflicts with other bookings
    const conflictingBooking = await ParkingBooking.findOne({
      parkingSpot: parkingSpot._id,
      status: { $in: ['confirmed', 'active'] },
      $or: [
        // New booking starts during an existing booking
        {
          startTime: { $lte: new Date(startTime) },
          endTime: { $gte: new Date(startTime) }
        },
        // New booking ends during an existing booking
        {
          startTime: { $lte: new Date(endTime) },
          endTime: { $gte: new Date(endTime) }
        },
        // New booking encompasses an existing booking
        {
          startTime: { $gte: new Date(startTime) },
          endTime: { $lte: new Date(endTime) }
        }
      ]
    });

    if (conflictingBooking) {
      // Try to find another available spot
      console.log('Conflict detected, trying to find another spot');
      
      parkingSpot = await ParkingSpot.findOne({
        parkingId: parkingId,
        _id: { $ne: parkingSpot._id }, // Exclude the current spot
        status: 'available',
        vehicleTypesAccepted: vehicleType,
        isDisabled: false
      });
      
      if (!parkingSpot) {
        return res.status(400).json({
          success: false,
          message: 'Time slot conflicts with an existing booking and no alternative spots are available'
        });
      }
      
      console.log('Found alternative spot:', parkingSpot._id);
    }

    // Mark parking spot as reserved
    parkingSpot.status = 'reserved';
    await parkingSpot.save();

    // Validate booking type
    if (!['hourly', 'daily', 'monthly'].includes(bookingType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking type. Must be hourly, daily, or monthly'
      });
    }

    // Calculate duration and amount based on booking type
    let amount = 0;
    let taxRate = 0.05; // 5% tax
    let duration = 0;

    // Parse dates
    const start = new Date(startTime);
    const end = new Date(endTime);

    // ---------- DYNAMIC PRICING IMPLEMENTATION ----------
    
    // Get base rates from parking object
    let hourlyRate = parking.rates.hourly;
    let dailyRate = parking.rates.daily;
    let monthlyRate = parking.rates.monthly;
    
    // Check for peak hours (weekday mornings and evenings)
    const hour = start.getHours();
    const day = start.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekday = day >= 1 && day <= 5;
    const isPeakHour = isWeekday && ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 19));
    
    // Apply peak hour surge pricing (25% increase)
    if (isPeakHour) {
      hourlyRate *= 1.25;
      dailyRate *= 1.15; // Less impact on daily rate
      console.log(`Applied peak hour surge pricing: hourly=${hourlyRate}, daily=${dailyRate}`);
    }
    
    // Apply weekend pricing for daily and hourly (10% increase)
    const isWeekend = day === 0 || day === 6;
    if (isWeekend) {
      hourlyRate *= 1.1;
      dailyRate *= 1.1;
      console.log(`Applied weekend pricing: hourly=${hourlyRate}, daily=${dailyRate}`);
    }
    
    // Apply location-based pricing adjustment
    // Central/premium locations have higher rates
    if (parking.location && parking.location.isPremium) {
      hourlyRate *= 1.2;
      dailyRate *= 1.15;
      monthlyRate *= 1.1;
      console.log(`Applied premium location pricing`);
    }
    
    // Apply vehicle type surcharge
    if (vehicleType === 'SUV' || vehicleType === 'large') {
      hourlyRate *= 1.15;
      dailyRate *= 1.15;
      monthlyRate *= 1.1;
      console.log(`Applied large vehicle surcharge`);
    }
    
    // Calculate occupancy rate of the parking
    const totalSpots = await ParkingSpot.countDocuments({ parkingId: parkingId });
    const occupiedSpots = await ParkingSpot.countDocuments({ 
      parkingId: parkingId,
      status: { $in: ['reserved', 'occupied'] }
    });
    
    const occupancyRate = totalSpots > 0 ? occupiedSpots / totalSpots : 0;
    
    // Apply demand-based pricing (higher rates when lot is filling up)
    if (occupancyRate > 0.85) {
      // High demand - 30% surge when more than 85% full
      hourlyRate *= 1.3;
      dailyRate *= 1.2;
      console.log(`Applied high demand surge (${Math.round(occupancyRate * 100)}% occupancy)`);
    } else if (occupancyRate > 0.7) {
      // Medium demand - 15% surge when more than 70% full
      hourlyRate *= 1.15;
      dailyRate *= 1.1;
      console.log(`Applied medium demand surge (${Math.round(occupancyRate * 100)}% occupancy)`);
    } else if (occupancyRate < 0.3) {
      // Low demand - 10% discount when less than 30% full
      hourlyRate *= 0.9;
      dailyRate *= 0.95;
      console.log(`Applied low demand discount (${Math.round(occupancyRate * 100)}% occupancy)`);
    }
    
    // Calculate amount based on booking type and adjusted rates
    if (bookingType === 'hourly') {
      // Calculate hours, rounding up
      const diffMs = end - start;
      const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
      duration = diffHrs;
      amount = hourlyRate * diffHrs;
      console.log(`Hourly booking: ${diffHrs} hours at rate ${hourlyRate} = ${amount}`);
    } else if (bookingType === 'daily') {
      // Calculate days, rounding up
      const diffMs = end - start;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      duration = diffDays;
      amount = dailyRate * diffDays;
      console.log(`Daily booking: ${diffDays} days at rate ${dailyRate} = ${amount}`);
    } else if (bookingType === 'monthly') {
      // Calculate months, using 30 days as a month
      const diffMs = end - start;
      const diffMonths = Math.ceil(diffMs / (1000 * 60 * 60 * 24 * 30));
      duration = diffMonths;
      amount = monthlyRate * diffMonths;
      console.log(`Monthly booking: ${diffMonths} months at rate ${monthlyRate} = ${amount}`);
    }
    
    // Apply loyalty discount for returning users
    const previousBookings = await ParkingBooking.countDocuments({ 
      user: req.user.id,
      createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } // Within last 90 days
    });
    
    let loyaltyDiscount = 0;
    if (previousBookings >= 10) {
      loyaltyDiscount = 0.15; // 15% discount for 10+ bookings
      amount *= 0.85;
      console.log(`Applied 15% loyalty discount (${previousBookings} previous bookings)`);
    } else if (previousBookings >= 5) {
      loyaltyDiscount = 0.1; // 10% discount for 5+ bookings
      amount *= 0.9;
      console.log(`Applied 10% loyalty discount (${previousBookings} previous bookings)`);
    } else if (previousBookings >= 2) {
      loyaltyDiscount = 0.05; // 5% discount for 2+ bookings
      amount *= 0.95;
      console.log(`Applied 5% loyalty discount (${previousBookings} previous bookings)`);
    }

    // Calculate tax
    const tax = amount * taxRate;
    const totalAmount = amount + tax;

    // Round to 2 decimal places
    const formattedAmount = Math.round(amount * 100) / 100;
    const formattedTax = Math.round(tax * 100) / 100;
    const formattedTotalAmount = Math.round(totalAmount * 100) / 100;

    console.log(`Final amount: ${formattedAmount}, tax: ${formattedTax}, total: ${formattedTotalAmount}`);

    // Generate booking code
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(10000 + Math.random() * 90000); // 5-digit random number
    const bookingCode = `PRK-${date}-${random}`;

    // Create parking booking
    const parkingBooking = new ParkingBooking({
      user: req.user.id,
      parking: parkingId,
      parkingSpot: parkingSpot._id,
      bookingType,
      startTime,
      endTime,
      duration,
      vehicleType,
      vehicleNumber,
      amount: formattedAmount,
      tax: formattedTax,
      totalAmount: formattedTotalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      bookingCode,
      status: 'confirmed',
      // Add check-in grace period - default 30 minutes
      checkInDeadline: new Date(new Date(startTime).getTime() + (30 * 60 * 1000))
    });

    // Generate QR code for entry
    const qrData = {
      bookingCode,
      userId: req.user.id,
      parkingId,
      parkingSpotId: parkingSpot._id.toString(),
      vehicleNumber,
      startTime,
      endTime,
      timestamp: Date.now()
    };
    parkingBooking.qrCode = Buffer.from(JSON.stringify(qrData)).toString('base64');

    await parkingBooking.save();
    console.log(`Parking booking created with code: ${bookingCode}`);

    // Schedule auto-cancellation job for no-shows
    scheduleAutoCancellation(parkingBooking._id);

    // Populate the booking with user and parking data
    const populatedBooking = await ParkingBooking.findById(parkingBooking._id)
      .populate('user', 'name email phone')
      .populate('parking', 'name address location')
      .populate('parkingSpot', 'spotNumber level section type');

    res.status(201).json({
      success: true,
      data: populatedBooking,
      // Include pricing breakdown for transparency
      pricingDetails: {
        baseRate: {
          hourly: parking.rates.hourly, 
          daily: parking.rates.daily, 
          monthly: parking.rates.monthly
        },
        peakHourSurge: isPeakHour ? 25 : 0,
        weekendSurcharge: isWeekend ? 10 : 0,
        premiumLocationFee: parking.location && parking.location.isPremium ? 15 : 0,
        vehicleTypeSurcharge: (vehicleType === 'SUV' || vehicleType === 'large') ? 15 : 0,
        demandBasedAdjustment: occupancyRate > 0.85 ? 30 : (occupancyRate > 0.7 ? 15 : (occupancyRate < 0.3 ? -10 : 0)),
        loyaltyDiscount: loyaltyDiscount * 100,
        taxPercentage: taxRate * 100
      },
      // Include offline access metadata
      offlineAccess: {
        qrCode: parkingBooking.qrCode,
        bookingCode: bookingCode,
        spotDetails: {
          spotNumber: parkingSpot.spotNumber,
          level: parkingSpot.level,
          section: parkingSpot.section
        },
        parkingName: parking.name,
        parkingAddress: parking.address,
        validFrom: startTime,
        validUntil: endTime
      }
    });

  } catch (err) {
    console.error('Error creating parking booking:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

/**
 * Function to schedule auto-cancellation for no-shows
 */
const scheduleAutoCancellation = async (bookingId) => {
  try {
    const booking = await ParkingBooking.findById(bookingId);
    if (!booking) return;

    const checkInDeadline = new Date(booking.checkInDeadline);
    const now = new Date();
    const timeUntilDeadline = checkInDeadline.getTime() - now.getTime();

    if (timeUntilDeadline <= 0) return; // Deadline already passed

    // In a production app, this would use a job scheduler like Bull or Agenda
    // For now, we'll use setTimeout (not recommended for production)
    setTimeout(async () => {
      try {
        const refreshedBooking = await ParkingBooking.findById(bookingId);
        if (!refreshedBooking || refreshedBooking.status !== 'confirmed') return;

        // Check if user has checked in
        if (!refreshedBooking.checkInTime) {
          console.log(`Auto-cancelling booking ${refreshedBooking.bookingCode} due to no-show`);
          
          // Update booking status to cancelled
          refreshedBooking.status = 'cancelled';
          refreshedBooking.cancellationReason = 'auto-cancelled due to no-show';
          await refreshedBooking.save();

          // Release the parking spot
          const parkingSpot = await ParkingSpot.findById(refreshedBooking.parkingSpot);
          if (parkingSpot) {
            parkingSpot.status = 'available';
            await parkingSpot.save();
          }

          // In a real app, also send notification to user
        }
      } catch (error) {
        console.error('Error in auto-cancellation job:', error);
      }
    }, timeUntilDeadline);

    console.log(`Auto-cancellation scheduled for booking ${booking.bookingCode} at ${checkInDeadline}`);
  } catch (error) {
    console.error('Error scheduling auto-cancellation:', error);
  }
}; 
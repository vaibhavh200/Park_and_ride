const RideService = require('../models/RideService');
const Vehicle = require('../models/Vehicle');

// Get all ride services
exports.getAllRideServices = async (req, res) => {
  try {
    const rideServices = await RideService.find()
      .populate('vehicles')
      .select('-__v');
    res.json(rideServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single ride service
exports.getRideService = async (req, res) => {
  try {
    const rideService = await RideService.findById(req.params.id)
      .populate('vehicles')
      .select('-__v');
    if (!rideService) {
      return res.status(404).json({ message: 'Ride service not found' });
    }
    res.json(rideService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new ride service
exports.createRideService = async (req, res) => {
  try {
    const rideService = new RideService({
      name: req.body.name,
      description: req.body.description,
      basePrice: req.body.basePrice,
      pricePerKm: req.body.pricePerKm,
      vehicleTypes: req.body.vehicleTypes,
      operationalAreas: req.body.operationalAreas,
      operatingHours: req.body.operatingHours,
      features: req.body.features
    });

    const newRideService = await rideService.save();
    res.status(201).json(newRideService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a ride service
exports.updateRideService = async (req, res) => {
  try {
    const rideService = await RideService.findById(req.params.id);
    if (!rideService) {
      return res.status(404).json({ message: 'Ride service not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (rideService.schema.paths[key]) {
        rideService[key] = req.body[key];
      }
    });

    const updatedRideService = await rideService.save();
    res.json(updatedRideService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a ride service
exports.deleteRideService = async (req, res) => {
  try {
    const rideService = await RideService.findById(req.params.id);
    if (!rideService) {
      return res.status(404).json({ message: 'Ride service not found' });
    }

    // Update any vehicles assigned to this ride service
    await Vehicle.updateMany(
      { assignedRideService: req.params.id },
      { $unset: { assignedRideService: 1 } }
    );

    await rideService.remove();
    res.json({ message: 'Ride service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get ride services by operational area
exports.getRideServicesByArea = async (req, res) => {
  try {
    const { area } = req.params;
    const rideServices = await RideService.find({
      operationalAreas: { $regex: new RegExp(area, 'i') }
    }).populate('vehicles');
    res.json(rideServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 
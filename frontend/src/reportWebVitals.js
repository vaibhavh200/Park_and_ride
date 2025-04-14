const reportWebVitals = (onPerfEntry) => {
  // This is a simplified version that doesn't rely on the web-vitals library
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // We'll skip actual measurement for now
    console.log('Performance reporting is disabled');
  }
};

export default reportWebVitals; 
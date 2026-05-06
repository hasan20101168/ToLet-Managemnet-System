mapboxgl.accessToken = mapToken;
  // creates the map, setting the container to the id of the div you added in step 2, and setting the initial center and zoom level of the map
  const map = new mapboxgl.Map({
      container: 'map', // container ID
      center: rental.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
      zoom: 9 // starting zoom
  });

  new mapboxgl.Marker()
    .setLngLat(rental.geometry.coordinates)
    .addTo(map)
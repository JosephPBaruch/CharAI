# Engineering Log - Feburary, 2026
## Feburary 6th - 11th 2026
Today I spent time  understanding why my terrain dataframe looked “off.” I realized that even though I was asking for 5×5 m cells, the code was actually grouping pixels into 10×10 m cells because pixels_per_cell was ending up as 2. I double-checked this against the actual GeoTIFF and confirmed that the DEM pixels are already about 5 m, which explained the smaller-than-expected row count.

I decided it’s important for the pipeline to clearly track both the requested cell size and the actual effective cell size it ends up using, so future me (or anyone else) doesn’t get confused again.

I also took a closer look at the terrain statistics and felt more confident that the elevation and slope values now make sense for the Palouse — average slopes around ~5° with max values around ~15°. I spent some time really wrapping my head around how aspect encoding works (aspect_northness and aspect_eastness) and why representing direction as a unit vector is better for machine learning than raw degrees.

Finally, I thought more about how this will work across multiple farms. I concluded that I should stick to general, physically meaningful terrain features (elevation stats, slope, and aspect encodings) and avoid using raw row/col or absolute latitude/longitude as model inputs so the model doesn’t just memorize specific farms.

- 
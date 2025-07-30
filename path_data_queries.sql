-- Query to display all path_data with readable linestring format
SELECT 
    vnum,
    zone_vnum,
    path_type,
    name,
    path_props,
    ST_AsText(path_linestring) as linestring_text
FROM path_data 
ORDER BY zone_vnum, vnum;

-- Alternative query with more detailed output including linestring analysis
SELECT 
    vnum,
    zone_vnum,
    path_type,
    name,
    path_props,
    ST_AsText(path_linestring) as linestring_text,
    ST_NumPoints(path_linestring) as num_points,
    ST_Length(path_linestring) as path_length
FROM path_data 
ORDER BY zone_vnum, vnum;

-- Query to get sample data for each path type (if any exist)
SELECT 
    path_type,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT name LIMIT 3) as example_names
FROM path_data 
GROUP BY path_type
ORDER BY path_type;

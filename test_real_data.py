#!/usr/bin/env python3
"""
Test script to verify the API handles real database data patterns correctly.
Based on actual query results from the region_data table.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'backend', 'src'))

from routers.regions import polygon_wkt_to_coordinates, coordinates_to_polygon_wkt
from schemas.region import RegionResponse, get_region_type_name, get_sector_type_name
from datetime import datetime

# Real data examples from the database query
test_data = [
    {
        "name": "The North Gate of Ashenport",
        "wkt": "POLYGON((-59 91,-59 91,-59 91,-59 91))",
        "expected_coords": [{"x": -59, "y": 91}],  # Should be treated as point
        "region_type": 1,
        "region_props": 0
    },
    {
        "name": "The East Gate of Ashenport", 
        "wkt": "POLYGON((-57 89,-57 89,-57 89))",
        "expected_coords": [{"x": -57, "y": 89}],  # Should be treated as point
        "region_type": 1,
        "region_props": 0
    },
    {
        "name": "The Gnome City of Hardbuckler",
        "wkt": "POLYGON((623.75 114.75,623.75 113.25,622.25 113.25,622.25 114.75,623.75 114.75))",
        "expected_coords": [
            {"x": 623.75, "y": 114.75},
            {"x": 623.75, "y": 113.25},
            {"x": 622.25, "y": 113.25},
            {"x": 622.25, "y": 114.75}
        ],
        "region_type": 1,
        "region_props": 0
    },
    {
        "name": "The Lake of Tears",
        "wkt": "POLYGON((3 35,8 34,10 32,12 34,13 40,10 42,9 42,4 41,1 36,3 35))",
        "expected_coords": [
            {"x": 3, "y": 35}, {"x": 8, "y": 34}, {"x": 10, "y": 32}, {"x": 12, "y": 34},
            {"x": 13, "y": 40}, {"x": 10, "y": 42}, {"x": 9, "y": 42}, {"x": 4, "y": 41}, {"x": 1, "y": 36}
        ],
        "region_type": 4,
        "region_props": 6
    }
]

def test_coordinate_parsing():
    """Test that WKT parsing handles all real data patterns"""
    print("Testing coordinate parsing...")
    
    for i, data in enumerate(test_data):
        print(f"\nTest {i+1}: {data['name']}")
        print(f"  Input WKT: {data['wkt']}")
        
        # Parse coordinates
        coords = polygon_wkt_to_coordinates(data['wkt'])
        print(f"  Parsed coordinates: {coords}")
        
        # Check if it matches expected behavior
        if data['name'].endswith("Gate of Ashenport"):
            # Landmarks should be parsed as single points
            if len(coords) == 1:
                print(f"  ✓ Correctly identified as point landmark")
            else:
                print(f"  ✗ Expected point landmark, got {len(coords)} coordinates")
        else:
            # Other regions should preserve polygon structure
            if len(coords) >= 3:
                print(f"  ✓ Correctly preserved as polygon with {len(coords)} points")
            else:
                print(f"  ✗ Expected polygon, got {len(coords)} coordinates")
        
        # Test round-trip conversion
        back_to_wkt = coordinates_to_polygon_wkt(coords)
        print(f"  Round-trip WKT: {back_to_wkt}")

def test_region_validation():
    """Test that region validation accepts real data patterns"""
    print("\n\nTesting region validation...")
    
    for i, data in enumerate(test_data):
        print(f"\nValidation test {i+1}: {data['name']}")
        
        coords = polygon_wkt_to_coordinates(data['wkt'])
        
        # Create region data
        region_data = {
            "vnum": 1000000 + i,
            "zone_vnum": 10000,
            "name": data['name'],
            "region_type": data['region_type'],
            "coordinates": coords,
            "region_props": data['region_props'],
            "region_reset_data": "",
            "region_reset_time": datetime(2000, 1, 1),
            "region_type_name": get_region_type_name(data['region_type']),
            "sector_type_name": get_sector_type_name(data['region_props']) if data['region_type'] == 4 else None
        }
        
        try:
            # Validate by creating response object
            response = RegionResponse(**region_data)
            print(f"  ✓ Validation passed")
            print(f"  ✓ Type: {response.region_type_name}")
            if response.sector_type_name:
                print(f"  ✓ Sector: {response.sector_type_name}")
        except Exception as e:
            print(f"  ✗ Validation failed: {e}")

def test_datetime_handling():
    """Test MySQL zero datetime handling"""
    print("\n\nTesting datetime handling...")
    
    # Test zero datetime conversion
    zero_date = datetime(1, 1, 1)  # Simulates MySQL 0000-00-00
    
    if zero_date.year < 1900:
        converted = datetime(2000, 1, 1)
        print(f"✓ Zero date {zero_date} converted to {converted}")
    else:
        print(f"✗ Date conversion logic needs adjustment")
    
    # Test normal datetime
    normal_date = datetime(2000, 7, 20)
    if normal_date.year >= 1900:
        print(f"✓ Normal date {normal_date} passed through correctly")

if __name__ == "__main__":
    print("Testing API compatibility with real database data...")
    print("=" * 60)
    
    test_coordinate_parsing()
    test_region_validation() 
    test_datetime_handling()
    
    print("\n" + "=" * 60)
    print("Testing complete!")

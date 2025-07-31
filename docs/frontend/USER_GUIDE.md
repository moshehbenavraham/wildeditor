# User Guide - Luminari Wilderness Editor

Welcome to the Luminari Wilderness Editor! This guide will help you get started with creating and editing wilderness regions, paths, and landmarks for the LuminariMUD game world.

## 🚀 Getting Started

### Accessing the Editor

1. **Open your web browser** and navigate to the editor URL
2. **Sign in** using your Google account
3. **Wait for the map to load** - this may take a few moments
4. **Familiarize yourself** with the interface layout

### Interface Overview

The editor consists of three main areas:

```
┌─────────────────────────────────────────────────────┐
│ Header: User info, Save/Commit buttons             │
├──────────────┬──────────────────────────────────────┤
│ Tool Panel   │ Map Canvas                           │
│              │                                      │
│ - Drawing    │ Interactive wilderness map with      │
│   tools      │ zoom, pan, and click functionality   │
│ - Layers     │                                      │
│ - Settings   │                                      │
│              │                                      │
├──────────────┼──────────────────────────────────────┤
│ Info Panel   │ Coordinate Display                   │
│              │                                      │
│ Selected     │ Current mouse position:              │
│ feature      │ X: 125, Y: 200                      │
│ details      │                                      │
└──────────────┴──────────────────────────────────────┘
```

## 🛠️ Tools and Controls

### Drawing Tools

#### Select Tool 🎯
- **Purpose**: Select and edit existing features with precision
- **Enhanced Selection**:
  - **Regions**: Uses point-in-polygon algorithm for accurate selection
  - **Paths**: Uses distance-to-line calculation for precise path selection
  - **Points**: Improved hit detection with zoom-aware radius
- **Features**: 
  - View and edit feature properties
  - Validated coordinate input with bounds checking (-1024 to +1024)
  - Delete selected features with confirmation

#### Point Tool 📍
- **Purpose**: Create single-point landmarks
- **Usage**: Click anywhere on the map to place a point
- **Use Cases**:
  - Landmarks (cities, dungeons, monuments)
  - Spawn points
  - Special locations

#### Polygon Tool ⬟
- **Purpose**: Draw regions with multiple boundaries
- **Usage**: 
  1. Click to start drawing
  2. Click additional points to define the boundary (minimum 3 points required)
  3. Press **Enter** to finish or **Escape** to cancel
- **Visual Feedback**:
  - 🟡 **Orange**: Drawing in progress (needs more points)
  - 🟢 **Green**: Valid polygon ready to finish
  - Real-time point counter and status display
- **Use Cases**:
  - Geographic regions (forests, mountains)
  - Encounter zones
  - Terrain override areas

#### Linestring Tool ➖
- **Purpose**: Draw linear features
- **Usage**:
  1. Click to start the line
  2. Click additional points along the path (minimum 2 points required)
  3. Press **Enter** to finish or **Escape** to cancel
- **Visual Feedback**:
  - 🟡 **Orange**: Drawing in progress (needs more points)
  - 🟢 **Green**: Valid path ready to finish
  - Real-time point counter and guidance
- **Use Cases**:
  - Roads and paths
  - Rivers and streams
  - Boundaries

### Map Controls

#### Zoom Controls
- **Zoom In/Out**: Use mouse wheel or zoom buttons
- **Zoom Levels**: 50%, 100%, 200%, 400%
- **Coordinate Precision**: Adjusts automatically with zoom level
  - 100%: 1x1 coordinate precision
  - 200%: 2x2 coordinate precision

#### Pan and Navigate
- **Mouse Drag**: Click and drag to pan the map
- **Keyboard**: Use arrow keys for precise movement
- **Go to Coordinates**: Enter specific coordinates to jump to location

### Layer Controls

#### Visibility Toggles
- **Regions**: Show/hide all regions
- **Paths**: Show/hide all paths
- **Grid**: Show/hide coordinate grid
- **Labels**: Show/hide feature names

#### Filter Options
- **By Type**: Filter regions or paths by their type
- **By Zone**: Show only features from specific zones
- **By Name**: Search for features by name

## 📝 Creating Features

### Creating a Region

1. **Select the Polygon Tool** from the tool panel
2. **Choose region type** from the dropdown:
   - **Geographic**: Named areas and landmarks that enhance descriptions without changing terrain (forests, political boundaries, notable locations)
   - **Encounter**: Special encounter zones
   - **Sector Transform**: Modify existing terrain
   - **Sector**: Override terrain completely
3. **Click on the map** to start drawing the boundary
4. **Add points** by clicking to define the region shape
5. **Complete the polygon** by double-clicking or pressing Enter
6. **Fill in details** in the info panel:
   - Name
   - Zone number
   - Properties
7. **Save your work** using the Save button

### Creating a Path

1. **Select the Linestring Tool** from the tool panel
2. **Choose path type** from the dropdown:
   - **Road**: Paved roads
   - **Dirt Road**: Unpaved roads
   - **River**: Flowing water
   - **Stream**: Small waterways
   - **Geographic**: Other linear features
3. **Click on the map** to start the path
4. **Add waypoints** by clicking along the desired route
5. **Complete the path** by double-clicking or pressing Enter
6. **Fill in details** in the info panel:
   - Name
   - Zone number
   - Properties
7. **Save your work** using the Save button

### Creating a Landmark

1. **Select the Point Tool** from the tool panel
2. **Click on the map** at the desired location
3. **Fill in details** in the info panel:
   - Name
   - Type (landmark, spawn point, etc.)
   - Zone number
   - Properties
4. **Save your work** using the Save button

## ✏️ Editing Features

### Selecting Features

1. **Switch to Select Tool** 🎯
2. **Click on any feature** on the map
3. **View details** in the info panel
4. **Make changes** as needed

### Editing Coordinates

#### Visual Editing
- **Drag vertices**: Click and drag corner points to move them
- **Add vertices**: Click on line segments to add new points
- **Remove vertices**: Right-click on points to remove them

#### Manual Editing
- **Coordinate list**: Edit X,Y values directly in the info panel
- **Add coordinates**: Use the "Add Point" button
- **Reorder points**: Drag points in the list to reorder them
- **Delete points**: Use the delete button next to each coordinate

### Modifying Properties

1. **Select the feature** you want to modify
2. **Update fields** in the info panel:
   - Name
   - Type
   - Zone assignment
   - Special properties
3. **Save changes** using the Save button

## 🚨 Error Handling & User Feedback

### Visual Feedback System

The editor provides comprehensive visual feedback to guide your editing:

#### Drawing Status Indicators
- **🟡 Orange Elements**: Drawing in progress, more points needed
- **🟢 Green Elements**: Valid drawing ready to finish
- **Real-time Counter**: Shows current points vs. minimum required
- **Status Overlay**: Displays drawing progress and keyboard shortcuts

#### Error Notifications
- **Auto-dismiss**: Error messages appear in the top-right corner
- **Clear Actions**: Click the X button or wait 5 seconds for auto-dismissal
- **Helpful Messages**: Specific guidance on what went wrong and how to fix it

#### Loading States
- **Data Operations**: Loading overlay appears during API calls
- **Progress Feedback**: Visual indication when saving or loading data
- **Smooth Transitions**: Optimistic updates with automatic rollback on failures

### Input Validation

#### Coordinate Bounds
- **Range**: All coordinates must be between -1024 and +1024
- **Auto-correction**: Invalid coordinates are automatically clamped to valid range
- **Visual Indicators**: Invalid inputs are highlighted in red

#### Drawing Requirements
- **Polygons**: Minimum 3 points required
- **Paths**: Minimum 2 points required
- **Real-time Validation**: Immediate feedback on drawing validity

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **S** | Switch to Select tool |
| **P** | Switch to Point tool |
| **G** | Switch to Polygon tool |
| **L** | Switch to Linestring tool |
| **Enter** | Finish current drawing |
| **Escape** | Cancel drawing or clear selection |

## 💾 Saving and Committing

### Session-Based Editing

The editor uses a session-based system:
- **Local Changes**: Edits are saved locally first
- **Preview Mode**: See changes before committing
- **Commit Process**: Push changes to the game database

### Save vs Commit

#### Save (Local)
- **Purpose**: Save your work in progress
- **Effect**: Changes stored in your browser session
- **Visibility**: Only you can see the changes
- **Usage**: Save frequently while working

#### Commit (Database)
- **Purpose**: Make changes live in the game
- **Effect**: Updates the game database
- **Visibility**: Changes appear immediately in-game
- **Usage**: Commit when you're satisfied with your changes

### Commit Process

1. **Review your changes** in the preview panel
2. **Write a commit message** describing what you changed
3. **Click Commit** to push changes to the database
4. **Verify success** - you'll see a confirmation message

## 🔍 Advanced Features

### Coordinate System

The wilderness uses a coordinate system from -1024 to +1024:
- **Origin (0,0)**: Center of the wilderness
- **North**: Positive Y direction
- **South**: Negative Y direction
- **East**: Positive X direction
- **West**: Negative X direction

### Polygon Validation

The editor automatically validates polygons:
- **Self-intersection**: Prevents lines from crossing themselves
- **Minimum points**: Ensures polygons have at least 3 points
- **Closure**: Automatically closes polygons
- **Auto-fix**: Offers to fix common issues

### Bulk Operations

#### Multi-select
- **Hold Ctrl/Cmd**: Click multiple features to select them
- **Drag selection**: Draw a box to select multiple features
- **Select all**: Use Ctrl+A to select all visible features

#### Bulk Actions
- **Move**: Drag selected features to move them together
- **Delete**: Remove multiple features at once
- **Properties**: Change properties for multiple features
- **Zone assignment**: Move features between zones

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `S` | Select tool |
| `P` | Point tool |
| `G` | Polygon tool |
| `L` | Linestring tool |
| `Ctrl+S` | Save session |
| `Ctrl+Enter` | Commit changes |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Delete` | Delete selected |
| `Escape` | Cancel current action |
| `+/-` | Zoom in/out |
| `Arrow keys` | Pan map |

## 🚨 Troubleshooting

### Common Issues

#### Map Not Loading
- **Check internet connection**
- **Refresh the page**
- **Clear browser cache**
- **Try a different browser**

#### Can't Save Changes
- **Verify you're logged in**
- **Check for error messages**
- **Ensure coordinates are valid (-1024 to 1024)**
- **Try refreshing and logging in again**

#### Features Not Appearing
- **Check layer visibility settings**
- **Verify zoom level (some features only show at certain zooms)**
- **Check filter settings**
- **Refresh the map data**

#### Polygon Won't Close
- **Ensure you have at least 3 points**
- **Double-click the last point**
- **Press Enter to finish**
- **Check for self-intersecting lines**

### Getting Help

If you encounter issues:
1. **Check this user guide** for solutions
2. **Look for error messages** in the interface
3. **Try the troubleshooting steps** above
4. **Contact support** through the help menu
5. **Report bugs** using the feedback form

## 📚 Best Practices

### Planning Your Work
- **Sketch on paper first** for complex regions
- **Use reference materials** (existing game maps, lore)
- **Plan zone boundaries** before creating features
- **Consider player experience** when placing features

### Naming Conventions
- **Use descriptive names**: "Darkwood Forest" not "Forest1"
- **Geographic regions**: Consider if it's area naming ("Iron Hills"), geo-political ("Merchant Quarter"), or landmark ("North Gate")
- **Be consistent**: Follow existing naming patterns
- **Include zone info**: Helpful for organization
- **Avoid special characters**: Stick to letters, numbers, spaces

### Quality Guidelines
- **Test your regions**: Walk through them in-game
- **Check boundaries**: Ensure they make sense geographically
- **Validate coordinates**: Double-check important locations
- **Document your work**: Use commit messages effectively

### Collaboration
- **Communicate with other builders**
- **Coordinate zone boundaries**
- **Share your plans** before major changes
- **Review others' work** when possible

## 🎯 Tips for Success

1. **Start small**: Begin with simple regions before complex ones
2. **Use layers**: Toggle visibility to focus on specific features
3. **Save frequently**: Don't lose your work
4. **Preview before committing**: Always review changes
5. **Learn the coordinate system**: Understanding helps with precision
6. **Use the right tool**: Each tool has its purpose
7. **Test in-game**: Verify your work in the actual game
8. **Ask for help**: Don't hesitate to reach out to other builders

Happy building! 🏗️

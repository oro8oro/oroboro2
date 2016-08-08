#Oroboro 2 - React



```sequence
Note over AppContainer: Cursor.observe & Cursor.observeChanges
AppContainer->App: addedLayers,addedGroups,addedItems,
AppContainer->App: changedLayers,changedGroups,changedItems
AppContainer->App: deletedLayers,deletedGroups,deletedItems
AppContainer->App: notEmpty

Note over Editor: <svg id='OEditor'>
App->Editor: addedLayers,addedGroups,addedItems
App->Editor: changedLayers,changedGroups,changedItems
App->Editor: deletedLayers,deletedGroups,deletedItems

```

## Editor

```uml

[Editor
    |
    layers: Map {id: Instance}
    groups: Map {id: Instance}
    items: Map {id: Instance}
    selectors: Map {id: Instance}
    |
    onLayerCreate()
    onGroupCreate()
    onItemCreate()
    onSelected()
    setListeners()
]

```



## SVG Canvas

```sequence


Editor->SVGCanvas: addedLayers,addedGroups,addedItems
Editor->SVGCanvas: changedLayers,changedGroups,changedItems
Editor->SVGCanvas: deletedLayers,deletedGroups,deletedItems
Editor->SVGCanvas: onLayerCreate()
Editor->SVGCanvas: onGroupCreate()
Editor->SVGCanvas: onItemCreate()
Note over SVGCanvas: <svg id='OCanvas'>
SVGCanvas->Layers: addedLayers,addedGroups,addedItems
SVGCanvas->Layers: changedLayers,changedGroups,changedItems
SVGCanvas->Layers: deletedLayers,deletedGroups,deletedItems
SVGCanvas->Layers: onLayerCreate()
SVGCanvas->Layers: onGroupCreate()
SVGCanvas->Layers: onItemCreate()
Layers->Groups: addedGroups,changedGroups,deletedGroups
Layers->Groups: addedItems,changedItems,deletedItems
Layers->Groups: onGroupCreate(),onItemCreate()
Groups->Items: addedItems,changedItems,deletedItems
Groups->Items: onItemCreate()

```

### Common

```uml

[Common
    |
    setClipboard()
]


```

## Menu


```sequence

Editor->SemanticLayers: container
Note over SemanticLayers: shouldComponentUpdate() false \n for layers,groups,items
Editor->SemanticLayers: layers,groups,items
Editor->SemanticLayers: selectors
SemanticLayers->Menu: freeOnStart 
SemanticLayers->Menu: freeOnStop 
SemanticLayers->Menu: changeType
SemanticLayers->Menu: onDelete
SemanticLayers->Menu: onInputChang

```

## Selectors

```sequence

SemanticLayers->Selectors: container
SemanticLayers->Selectors: singleSelectedElements
SemanticLayers->Selectors: multiSelectedElements
Selectors->ItemSelector: x,y,w,h
Selectors->ItemsSelector: x,y,w,h

```

### Selector

[Selector
    |
    
]



```uml
http://orobo.go.ro:5000/dot.txt
```
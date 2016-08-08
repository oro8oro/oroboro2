#Oroboro 2

## In Work:

```uml



[Path
  |
  closed: Boolean
  cache: Array
  |
  toggleClose()
  convertToCubic()
  pathAlongPath(path2)
]



[FunctionPath | 
    function: String
    xMin: Number
    xMax: Number
    yMin: Number
    yMax: Number
    resolution: Number

]





[Path]<:-[CubicPath]
[CubicPath]<:-[SimplePath]
[CubicPath]<:-[ArcPath]
[CubicPath]<:-[TurtlePath]
[CubicPath]<:-[TextPath | 
    Text

]

[FunctionPath]<:-[CartesianPath]
[FunctionPath]<:-[PolarPath]
[SimplePath]<:-[OrthoPath]
[SimplePath]<:-[SpiroPath]
[SimplePath]<:-[Algo1Path | attractorStrength]
[SimplePath]<:-[StraightPath]
[SimplePath]<:-[LinkPath]
[SimplePath]<:-[RoundCornersPath | ray]
[SimplePath]<:-[SawPath]
[StraightPath]<:-[FunctionPath]


```

```uml



[Path
  |
  closed: Boolean
  cache: Array
  |
  toggleClose()
  convertToCubic()
  pathAlongPath(path2)
]



[FunctionPath | 
    function: String
    xMin: Number
    xMax: Number
    yMin: Number
    yMax: Number
    resolution: Number

]







[Path]<:-[SimplePath]
[Path]<:-[CubicPath]
[Path]<:-[ArcPath]
[Path]<:-[TurtlePath]
[Path]<:-[TextPath | 
    Text

]

[FunctionPath]<:-[CartesianPath]
[FunctionPath]<:-[PolarPath]
[SimplePath]<:-[OrthoPath]
[SimplePath]<:-[SpiroPath]
[SimplePath]<:-[Algo1Path | attractorStrength]
[SimplePath]<:-[StraightPath]
[SimplePath]<:-[LinkPath]
[SimplePath]<:-[RoundCornersPath | ray]
[SimplePath]<:-[SawPath]
[StraightPath]<:-[FunctionPath]


```


```uml

[Item]<:-[Path]
[Item]<:-[Text]
[Item]<:-[ParametrizedItem]
[Item]<:-[Image]

[Item]<:-[NestedSVG]
[Item]<:-[Gradient]

[Image]<:-[RasterImage]
[Image]<:-[Formulae]
[Image]<:-[QRcode]

[ParametrizedItem]<:-[ParaComplexPath1]
[ParametrizedItem]<:-[ParaComplexPath2]
[ParametrizedItem]<:-[TextPath]

[Text
  |
  [.
    |text: String
  ]
  [font
    |
    style: String
    weight: String
    family: String
    size: String
    textAnchor: String
  ]
]
```






```uml

[DefaultElement
  |
  _id: String
  original: String
  ordering: Number
]

[File
  |
  [.
    |
    uuid: String
    creatorId: String
    dateModified: Date
    dateCreated: Date
    fileType: String
    version: String
    locked: Boolean
    title: String (?)
    dependencypath: Array
    structuralpath: Array
  ]
  [permissions
    |
    view: Array
    edit: Array
  ]
]

[Folder
  |
  noofchildren: Number
]

[SVGFile
  |
  fileType: image/svg+xml
  height: Number
  width: Number
  selected: Array
  groupids: Array
  itemids: Array
]

[SimpleFile
  |
  script: String
]

[JS
  |
  fileType: application/javascript
]


[CSS
  |
  fileType: text/css
]


[Markdown
  |
  fileType: text/plain
]

[GCode
  |
  fileType: gcode
]

[UML
  |
  fileType: text/plain
]

[JPEG
  |
  fileType: image/jpeg
]

[PNG
  |
  fileType: image/png
]

[Other
  |
  fileType: application/octet-stream
]


[Group
  |
  fileId: String
  type: String
  selected: Boolean
  locked: Boolean
  opacity: Number
  uuid: String
]

[Layer
  |
  [parameters
    |
    hide: Boolean
  ]
]




[DefaultElement]<:-[File]
[DefaultElement]<:-[Group]
[DefaultElement]<:-[Item]

[File]<:-[SVGFile]
[File]<:-[Folder]
[File]<:-[SimpleFile]

[SimpleFile]<:-[JS]
[SimpleFile]<:-[CSS]
[SimpleFile]<:-[Markdown]
[SimpleFile]<:-[UML]
[SimpleFile]<:-[GCode]
[SimpleFile]<:-[Image]
[SimpleFile]<:-[Other]

[Image]<:-[JPEG]
[Image]<:-[PNG]

[Group]<:-[Layer]
[Group]<:-[SimpleGroup]
[Group]<:-[ParametrizedGroup]


```



```uml

[ParametrizedGroup
  |
  [.|
    groupId: String
    type: "parametrizedGroup"
  ]
  [parameters|
    [.|
      callback: String (function name)
      output: String (cached g)
    ]
    [params]
  ]
]


[pointSymmetry
  |
  [parameters|
    [.|callback: "pointSymmetry"]
    [params|
      [elements|path:String]
      [.|
      pointX: Number
      pointY: Number
      repetitions: Number
      rotations: Number
      dscale: Number
      ]
    ]
  ]
]
[lineSymmetry
  |
  [parameters|
    [.|callback: "lineSymmetry"]
    [params|
      [elements|path:String]
      [.|
      pointX1: Number
      pointY1: Number
      pointX2: Number
      pointY2: Number
      repetitions: Number
      rotations: Number
      dscale: Number
      ]
    ]
  ]
]
[itemArray
  |
  [parameters|
    [.|callback: "itemArray"]
    [params|
      [elements|path:String]
      [.|
        repetitionsX: Number
        repetitionsY: Number
        dx: Number
        dy: Number
        deltax: Number
        deltay: Number
      ]
    ]
  ]
]


[ParametrizedGroup]<:-[pointSymmetry]
[ParametrizedGroup]<:-[lineSymmetry]
[ParametrizedGroup]<:-[itemArray]



```


```uml

[paraQrCode
  |
  [parameters|
    [.|callback: "paraQrCode"]
    [params|
      [elements|
        group:String
        path: String
      ]
      [.|
        text: String
        dimension:Number
      ]
    ]
  ]
]

[paraTextPath
  |
  [parameters|
    [.|callback: "paraQrCode"]
    [params|
    [elements|
      text:String
      path:String
    ]
    [.|visiblepath:Boolean]
    ]
  ]
]

[paraPathOnPath
  |
  [parameters|
    [.|callback: "paraQrCode"]
    [params|
      [elements|
      conductor:String
      content:String
      ]
      [.|
      visibleconductor:Boolean
      visiblecontent:Boolean
      repetitions: Number
      ]
    ]
  ]
]

[ParametrizedGroup]<:-[paraQrCode]
[ParametrizedGroup]<:-[paraTextPath]
[ParametrizedGroup]<:-[paraPathOnPath]


```


```uml

[Item
  |
  [.
    |
    _id: String
    type: String
    pointList: String
    groupId: String
    selected: Boolean
    locked: Boolean
  ]
  [palette
    |
    fillColor: String
    strokeColor: String
    strokeWidth: String
    fillOpacity: String
    strokeLinejoin: String
    strokeLinecap: String
    strokeDasharray: String
    strokeOpacity: String
    opacity: String
  ]
]

[Path
  |
  closed: Boolean
]

[Text
  |
  [.
    |text: String
  ]
  [font
    |
    style: String
    weight: String
    family: String
    size: String
    textAnchor: String
  ]
]


[ParametrizedItem
  |
  [parameters
    |
    params: Object
    callback: String (function name)
  ]
]

[ParaComplexPath1
  |
  [parameters->params
    |
    up: Number
    down: Number
    left: Number
    right: Number
    start: Number
    id_x: Number
  ]
]

[ParaComplexPath2
  |
  [parameters->params
    |
    width: Number
    height: Number
    x: Number
    y: Number
    rx: Number
    ry: Number
    maintainRatio: Boolean
  ]
]



[Item]<:-[Text]
[Item]<:-[Path]
[Item]<:-[ParametrizedItem]
[Item]<:-[Image]
[Item]<:-[ForeignObject]
[Item]<:-[NestedSVG]
[Item]<:-[Gradient]

[Image]<:-[RasterImage]
[Image]<:-[Formulae]
[Image]<:-[QRcode]

[ForeignObject]<:-[EmbeddedIFrame]
[ForeignObject]<:-[EmbeddedHtml]
[ForeignObject]<:-[EmbeddedCanvas]
[ForeignObject]<:-[EmbeddedMarkdown]

[ParametrizedItem]<:-[ParaComplexPath1]
[ParametrizedItem]<:-[ParaComplexPath2]
[ParametrizedItem]<:-[TextPath]

[Path]<:-[Simple Path]
[Path]<:-[Complex Path]
[Path]<:-[PathEquation]
[Path]<:-[PathEquationPolar]



```



```uml
http://orobo.go.ro:5000/dot.txt
```
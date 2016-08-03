/**
 * @summary Get the center and radius of a circle from 3 points.
 * @desc It finds the unique circle determined by three points.
 * Returns the center point and radii.<br />
 * @param a point object with x and y attributes
 * @param b point object with x and y attributes
 * @param c point object with x and y attributes
 * @return object with center, rv and rh attributes
 */
circleParams = function(a,b,c) {
  var d = a.x*(b.y-c.y) + b.x*(c.y-a.y) + c.x*(a.y-b.y);
  var center = {
      x: (
        (a.x*a.x + a.y*a.y)*(b.y - c.y) + 
        (b.x*b.x + b.y*b.y)*(c.y - a.y) +
        (c.x*c.x + c.y*c.y)*(a.y - b.y) 
      ) / (2*d),
      y: (
        (a.x*a.x + a.y*a.y)*(c.x - b.x) +
        (b.x*b.x + b.y*b.y)*(a.x - c.x) +
        (c.x*c.x + c.y*c.y)*(b.x - a.x)
      ) / (2*d)
    };
  var r = Math.sqrt(Math.pow(a.x - center.x, 2) + Math.pow(a.y - center.y, 2))
  return {
    center: center,
    rh: r,
    rv: r
  };
};

/**
 * @summary Get the center and radius of an ellipse, determined by 5 points.
 * @desc It finds the unique ellipse determined by 5 points.<br />
 * Inspiration: http://www.had2know.com/academics/conic-section-through-five-points.html
 * Returns the center point, radii and rotation.<br />
 * @param points array of point objects with x and y attributes
 * @return object with center, rv, rh, rot attributes
 */
ellipseParams = function(points) {
  if(!points || !points.length)
    return;
  var x1 = points[0].x, y1 = points[0].y, 
    x2 = points[1].x, y2 = points[1].y, 
    x3 = points[2].x, y3 = points[2].y, 
    x4 = points[3].x, y4 = points[3].y, 
    x5 = points[4].x, y5 = points[4].y;
  
  var mA = Matrix.create([
      [x1*y1, y1*y1, x1, y1, 1],
      [x2*y2, y2*y2, x2, y2, 1],
      [x3*y3, y3*y3, x3, y3, 1],
      [x4*y4, y4*y4, x4, y4, 1],
      [x5*y5, y5*y5, x5, y5, 1]
    ]),
    mB = Matrix.create([
      [x1*x1, y1*y1, x1, y1, 1],
      [x2*x2, y2*y2, x2, y2, 1],
      [x3*x3, y3*y3, x3, y3, 1],
      [x4*x4, y4*y4, x4, y4, 1],
      [x5*x5, y5*y5, x5, y5, 1]
    ]),
    mC = Matrix.create([
      [x1*x1, x1*y1, x1, y1, 1],
      [x2*x2, x2*y2, x2, y2, 1],
      [x3*x3, x3*y3, x3, y3, 1],
      [x4*x4, x4*y4, x4, y4, 1],
      [x5*x5, x5*y5, x5, y5, 1]
    ]),
    mD = Matrix.create([
      [x1*x1, x1*y1, y1*y1, y1, 1],
      [x2*x2, x2*y2, y2*y2, y2, 1],
      [x3*x3, x3*y3, y3*y3, y3, 1],
      [x4*x4, x4*y4, y4*y4, y4, 1],
      [x5*x5, x5*y5, y5*y5, y5, 1]
    ]),
    mE = Matrix.create([
      [x1*x1, x1*y1, y1*y1, x1, 1],
      [x2*x2, x2*y2, y2*y2, x2, 1],
      [x3*x3, x3*y3, y3*y3, x3, 1],
      [x4*x4, x4*y4, y4*y4, x4, 1],
      [x5*x5, x5*y5, y5*y5, x5, 1]
    ]),
    mF = Matrix.create([
      [x1*x1, x1*y1, y1*y1, x1, y1],
      [x2*x2, x2*y2, y2*y2, x2, y2],
      [x3*x3, x3*y3, y3*y3, x3, y3],
      [x4*x4, x4*y4, y4*y4, x4, y4],
      [x5*x5, x5*y5, y5*y5, x5, y5]
    ]);

  var A = Matrix.det(mA),
    B = - Matrix.det(mB),
    C = Matrix.det(mC),
    D = - Matrix.det(mD),
    E = Matrix.det(mE),
    F = - Matrix.det(mF);

  console.log('ellipse: ' + ((B*B - 4*A*C) < 0))

  // not ellipse (hyperbola, parabola)
  if((B*B - 4*A*C) >= 0)
    return;
  
  // http://mathworld.wolfram.com/Ellipse.html
  B = B/2;
  D = D/2;
  E = E/2;

  var center = {
    x: (C*D - B*E) / (B*B - A*C),
    y: (A*E - B*D) / (B*B - A*C)
  };
  var rh = Math.sqrt(
    2*(A*E*E + C*D*D + F*B*B - 2*B*D*E - A*C*F) /
    ((B*B - A*C) * (Math.sqrt((A-C)*(A-C) + 4*B*B) - (A+C) ))
  );
  var rv = Math.sqrt(
    2*(A*E*E + C*D*D + F*B*B - 2*B*D*E - A*C*F) /
    ((B*B - A*C) * (- Math.sqrt((A-C)*(A-C) + 4*B*B) - (A+C) ))
  );
  var rot, theta;
  if(B == 0 && A < C)
    theta = 0;
  else if(B == 0 && A > C)
    theta = Math.PI / 2;
  else if(B != 0 && A < C)
    theta = 1/2 * Math.atan(B / (C-A));
  else if(B != 0 && A > C)
    theta = Math.PI/2 + 1/2 * Math.atan(B / (C-A));
  else if (B != 0 && A == C)
    theta = Math.PI/4
  rot = turnCCW(0, theta);

  return {
    center: center,
    rv: rv,
    rh: rh,
    rot: rot
  };
};

var twoPI = 2*Math.PI

/**
 * @summary Turn given angle CW by given 2nd angle.
 * @desc Function for turning clockwise from given angle by other given dAngle.<br />
 * AKA adding the two angles while keeping result in [0, 2PI].<br />
 * A negative number means turning ccw.
 * @param angle angle value
 * @param dAngle angle difference
 * @return modified angle value
 */
turnCW = function(angle, dAngle) {
  angle = angle + dAngle;
  if(angle < 0) angle = twoPI + (angle % twoPI);
  else if(angle > 0) angle = angle % twoPI;
  return angle;
};

/**
 * @summary Turn given angle CCW by given 2nd angle.
 * @desc Function for turning counter-clockwise from given angle by other given dAngle.<br />
 * AKA substracting the 2nd from the 1st while keeping result in [0, 2PI].<br />
 * A negative number means turning cw.
 * @param angle angle value
 * @param dAngle angle difference
 * @return modified angle value
 */
turnCCW = function(angle, dAngle) {
  return turnCW(angle, -dAngle);
};

/**
 * @summary Get distance between two points.
 * @param p1 first point
 * @param p2 second point
 * @return distance in pixels
 */
distance = function(p1,p2) {
    if(!p1.x) p1 = {x: p1[0], y: p1[1]}
    if(!p2.x) p2 = {x: p2[0], y: p2[1]}
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

getAngle = function(center, p1) {
    if(!center.x) center = {x:center[0], y: center[1]}
    if(!p1.x) p1 = {x: p1[0], y: p1[1]}
  var p0 = {
    x: center.x, 
    y: center.y - Math.sqrt(Math.abs(p1.x - center.x) * 
        Math.abs(p1.x - center.x) + Math.abs(p1.y - center.y) * 
        Math.abs(p1.y - center.y))
  };
  var angle = (2 * Math.atan2(p1.y - p0.y, p1.x - p0.x));
  if(angle >= Math.PI/2)
    return angle - Math.PI/2;
  return 3/2*Math.PI + angle;
};

pointByAngleDistance = function(center, angle, distance) {
    if(!center.x)
        return [
            center[0] + distance * Math.cos(angle),
            center[1] + distance * Math.sin(angle)
        ]
  return {
    x: center.x + distance * Math.cos(angle),
    y: center.y + distance * Math.sin(angle)
  }; 
};

/**
 * @summary Calculates smaller difference between two angles.
 * @desc Function for calculating smaller difference, CW or CCW, between two angles.
 * @param alpha 1st angle
 * @param beta 2nd angle
 * @return smaller difference between 1st & 2nd angle
 */
angleDiff = function(alpha, beta) {
  var dA = Math.abs((alpha - beta) % twoPI);
  return Math.min(twoPI - dA, dA);
};

/**
 * @summary Calculates CW difference between two angles.
 * @desc Function for calculating the difference between two angles
 * in clockwise direction from first angle to second angle
 * @param alpha 1st angle
 * @param beta 2nd angle
 * @return CW difference between 1st & 2nd angle
 */
angleDiffCW = function(alpha, beta) {
  if(Math.abs(alpha) >= twoPI) alpha = alpha % twoPI;
  if(Math.abs(beta) >= twoPI) beta = beta % twoPI;
  if(alpha < 0) alpha = alpha + twoPI;
  if(beta < 0) beta = beta + twoPI;
  var dA = beta - alpha;
  if(beta < alpha) dA = twoPI + dA;
  return dA;
};

/**
 * @summary Calculates CCW difference between two angles.
 * @desc Function for calculating the difference between two angles
 * in counter clockwise direction from first angle to second angle.
 * @param alpha 1st angle
 * @param beta 2nd angle
 * @return CCW difference between 1st & 2nd angle
 */
angleDiffCCW = function(alpha, beta) {
  var diffCW = angleDiffCW(alpha, beta);
  if(diffCW == 0) dA = 0;
  else var dA = twoPI - diffCW;
  return dA;
};

rotatePoint = function(center, p1, dangle) {
    var a = getAngle(center, p1)
    var dist = distance(center, p1)
    a = turnCW(a, dangle)
    return pointByAngleDistance(center, a, dist)
}

/*computes intersection between a cubic spline and a line segment*/
function computeIntersections(px,py,lx,ly,inbounds)
{
    var X=Array();
    var A=ly[1]-ly[0];      //A=y2-y1
  var B=lx[0]-lx[1];      //B=x1-x2
  var C=lx[0]*(ly[0]-ly[1]) + 
          ly[0]*(lx[1]-lx[0]);  //C=x1*(y1-y2)+y1*(x2-x1)

  var bx = bezierCoeffs(px[0],px[1],px[2],px[3]);
  var by = bezierCoeffs(py[0],py[1],py[2],py[3]);
  
    var P = Array();
  P[0] = A*bx[0]+B*by[0];   /*t^3*/
  P[1] = A*bx[1]+B*by[1];   /*t^2*/
  P[2] = A*bx[2]+B*by[2];   /*t*/
  P[3] = A*bx[3]+B*by[3] + C; /*1*/
  
  var r=cubicRoots(P);
  var ints = []
    /*verify the roots are in bounds of the linear segment*/
    for (var i=0;i<3;i++)
    {
        t=r[i];
        X[0]=bx[0]*t*t*t+bx[1]*t*t+bx[2]*t+bx[3];
        X[1]=by[0]*t*t*t+by[1]*t*t+by[2]*t+by[3];            

        /*above is intersection point assuming infinitely long line segment,
          make sure we are also in bounds of the line*/
        if(inbounds) {
            var s;
            if ((lx[1]-lx[0])!=0)           //if not vertical line
                s=(X[0]-lx[0])/(lx[1]-lx[0]);
            else
                s=(X[1]-ly[0])/(ly[1]-ly[0]);
            
            //in bounds? 
            if (!(t<0 || t>1.0 || s<0 || s>1.0))
                ints.push(X)
        }
        if(t>0)
            ints.push([X[0], X[1]])

    }
    return ints
    
}

/*based on http://mysite.verizon.net/res148h4j/javascript/script_exact_cubic.html#the%20source%20code*/
function cubicRoots(P)
{
  var a=P[0];
  var b=P[1];
  var c=P[2];
  var d=P[3];
  
  var A=b/a;
  var B=c/a;
  var C=d/a;

    var Q, R, D, S, T, Im;

    var Q = (3*B - Math.pow(A, 2))/9;
    var R = (9*A*B - 27*C - 2*Math.pow(A, 3))/54;
    var D = Math.pow(Q, 3) + Math.pow(R, 2);    // polynomial discriminant

    var t=Array();
  
    if (D >= 0)                                 // complex or duplicate roots
    {
        var S = sgn(R + Math.sqrt(D))*Math.pow(Math.abs(R + Math.sqrt(D)),(1/3));
        var T = sgn(R - Math.sqrt(D))*Math.pow(Math.abs(R - Math.sqrt(D)),(1/3));

        t[0] = -A/3 + (S + T);                    // real root
        t[1] = -A/3 - (S + T)/2;                  // real part of complex root
        t[2] = -A/3 - (S + T)/2;                  // real part of complex root
        Im = Math.abs(Math.sqrt(3)*(S - T)/2);    // complex part of root pair   
        
        /*discard complex roots*/
        if (Im!=0)
        {
            t[1]=-1;
            t[2]=-1;
        }
    
    }
    else                                          // distinct real roots
    {
        var th = Math.acos(R/Math.sqrt(-Math.pow(Q, 3)));
        
        t[0] = 2*Math.sqrt(-Q)*Math.cos(th/3) - A/3;
        t[1] = 2*Math.sqrt(-Q)*Math.cos((th + 2*Math.PI)/3) - A/3;
        t[2] = 2*Math.sqrt(-Q)*Math.cos((th + 4*Math.PI)/3) - A/3;
        Im = 0.0;
    }
    
    /*discard out of spec roots*/
  for (var i=0;i<3;i++) 
        if (t[i]<0 || t[i]>1.0) t[i]=-1;
                
  /*sort but place -1 at the end*/
    t=sortSpecial(t);
    
  console.log(t[0]+" "+t[1]+" "+t[2]);
    return t;
}

function sortSpecial(a)
{
    var flip;
    var temp;
    
    do {
        flip=false;
        for (var i=0;i<a.length-1;i++)
        {
            if ((a[i+1]>=0 && a[i]>a[i+1]) ||
                (a[i]<0 && a[i+1]>=0))
            {
                flip=true;
                temp=a[i];
                a[i]=a[i+1];
                a[i+1]=temp;
                
            }
        }
    } while (flip);
  return a;
}

// sign of number
function sgn( x )
{
    if (x < 0.0) return -1;
    return 1;
}

function bezierCoeffs(P0,P1,P2,P3)
{
  var Z = Array();
  Z[0] = -P0 + 3*P1 + -3*P2 + P3; 
    Z[1] = 3*P0 - 6*P1 + 3*P2;
    Z[2] = -3*P0 + 3*P1;
    Z[3] = P0;
  return Z;
}
    
/*creates formated path string for SVG cubic path element*/
function pathCubic(x,y)
{
  return "M "+x[0]+" "+y[0]+" C "+x[1]+" "+y[1]+" "+x[2]+" "+y[2]+" "+x[3]+" "+y[3];
}

/*creates formated path string for SVG cubic path element*/
function pathLine(x,y)
{
  return "M "+x[0]+" "+y[0]+" L "+x[1]+" "+y[1];
}

slope = function(p1, p2) {
  return (p2[1] - p1[1]) / (p2[0] - p1[0]);
}


linesIntersection = function(l1, l2) {
  console.log(JSON.stringify(l1))
  console.log(JSON.stringify(l2))

  let m1 = slope(...l1),
    m2 = slope(...l2);

  if(!isFinite(m1) && !isFinite(m2))
    return;

  let b1 = l1[0][1] - m1*l1[0][0],
    b2 = l2[0][1] - m2*l2[0][0],
    x, y;

  if(!isFinite(m1)) {
    y = m2 * l1[0][0] + b2;
    x = l1[0][0];
  }
  else if(!isFinite(m2)) {
    y = m1 * l2[0][0] + b1;
    x = l2[0][0];
  }
  else {
    x = (b2 - b1) / (m1 - m2);
    y = m1 * x + b1;
  }
  
  console.log(m1,b1,m2,b2);
  console.log([x, y]);

  return [x, y];
}

circleToPath = function (circle) {
    return ellipseToPath(circle);
}

ellipseToPath = function (ellipse) {
    let x = ellipse.x(), 
      y= ellipse.y(),
      rx = parseFloat(ellipse.attr("rx") ? ellipse.attr("rx") : ellipse.attr("r")),
      ry = parseFloat(ellipse.attr("ry") ? ellipse.attr("ry") : rx),
      w = rx*2, h = ry*2,
      cx = ellipse.attr("cx"), 
      cy = ellipse.attr("cy"),
      delta = 4 * (Math.sqrt(2) - 1) / 3;

    return [
        [ 'M', (x+w/2), y ],
        [ 'C', (x+w/2+rx*delta), y, (x+w), (y+h/2 -ry*delta), (x+w), (y+h/2) ],
        [ 'C', (x+w), (y+h/2+ry*delta), (x+w/2+rx*delta), (y+h), (x+w/2), (y+h) ],
        [ 'C', (x+w/2-rx*delta), (y+h), x, (y+h/2+ry*delta), x, (y+h/2) ],
        [ 'C', x, (y+h/2-ry*delta), (x+w/2-rx*delta), y, (x+w/2), y ],
        [ 'Z' ]
      ];
}

rectToPath = function (rect) {
    let x = rect.x(), 
      y= rect.y(), 
      w = rect.width(), 
      h = rect.height();

    if(!rect.attr("rx")) {
      return [ 
        [ 'M', x, y ], 
        [ 'L', x+w, y ], 
        [ 'L', x+w, y+h ], 
        [ 'L', x, y+h ], 
        [ 'Z'] 
      ];
    }

    let rx = Number(rect.attr("rx")),
      ry = Number(rect.attr("ry")),
      delta = 4 * (Math.sqrt(2) - 1) / 3;
    
    return [
      [ 'M', x, (y+ry) ],
      [ 'C', x, (y+ry-ry*delta), (x+rx-rx*delta), y, (x+rx), y ],
      [ 'L', (x+w-rx), y ],
      [ 'C', (x+w-rx+rx*delta), y, (x+w), (y+ry-ry*delta), (x+w), (y+ry) ],
      [ 'L', (x+w), (y+h-ry) ],
      [ 'C', (x+w), (y+h-ry+ry*delta), (x+w-rx+rx*delta), (y+h), (x+w-rx), (y+h) ], 
      [ 'L', (x+rx), (y+h) ],
      [ 'C', (x+rx-rx*delta), (y+h), x, (y+h-ry+ry*delta), x, (y+h-ry) ],
      [ 'Z' ]
    ];
}

lineToPath = function (line) {
    return [
      [ 'M', line.attr("x1"), line.attr("y1") ],
      [ 'L', line.attr("x2"), line.attr("y2") ] 
    ];
}

polygonToPath = function(polygon) {
  polygon = polylineToPath(polygon);
  polygon.push([ 'Z' ]);
  return polygon;
}

polylineToPath = function (line) {
    let points = line.array().value;
    return [ [ 'M', points[0][0], points[0][1]] ]
      .concat(
        points.slice(1).map(p => [ 'L', p[0], p[1] ])
      );
}

function a2c(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {
        // https://github.com/adobe-webplatform/Snap.svg/blob/master/src/path.js
        // for more information of where this math came from visit:
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        var PI = Math.PI;
        var _120 = PI * 90 / 180, //120 initial
            rad = PI / 180 * (+angle || 0),
            res = [],
            xy,
            rotate = function (x, y, rad) {
                var X = x * Math.cos(rad) - y * Math.sin(rad),
                    Y = x * Math.sin(rad) + y * Math.cos(rad);
                return {x: X, y: Y};
            };
        if (!recursive) {
            xy = rotate(x1, y1, -rad);
            x1 = xy.x;
            y1 = xy.y;
            xy = rotate(x2, y2, -rad);
            x2 = xy.x;
            y2 = xy.y;
            var cos = Math.cos(PI / 180 * angle),
                sin = Math.sin(PI / 180 * angle),
                x = (x1 - x2) / 2,
                y = (y1 - y2) / 2;
            var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);
            if (h > 1) {
                h = Math.sqrt(h);
                rx = h * rx;
                ry = h * ry;
            }
            var rx2 = rx * rx,
                ry2 = ry * ry,
                k = (large_arc_flag == sweep_flag ? -1 : 1) *
                    Math.sqrt(Math.abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
                cx = k * rx * y / ry + (x1 + x2) / 2,
                cy = k * -ry * x / rx + (y1 + y2) / 2,
                f1 = Math.asin(((y1 - cy) / ry).toFixed(9)),
                f2 = Math.asin(((y2 - cy) / ry).toFixed(9));

            f1 = x1 < cx ? PI - f1 : f1;
            f2 = x2 < cx ? PI - f2 : f2;
            f1 < 0 && (f1 = PI * 2 + f1);
            f2 < 0 && (f2 = PI * 2 + f2);
            if (sweep_flag && f1 > f2) {
                f1 = f1 - PI * 2;
            }
            if (!sweep_flag && f2 > f1) {
                f2 = f2 - PI * 2;
            }
        } else {
            f1 = recursive[0];
            f2 = recursive[1];
            cx = recursive[2];
            cy = recursive[3];
        }
        var df = f2 - f1;
        if (Math.abs(df) > _120) {
            var f2old = f2,
                x2old = x2,
                y2old = y2;
            f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
            x2 = cx + rx * Math.cos(f2);
            y2 = cy + ry * Math.sin(f2);
            res = a2c(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
        }
        df = f2 - f1;
        var c1 = Math.cos(f1),
            s1 = Math.sin(f1),
            c2 = Math.cos(f2),
            s2 = Math.sin(f2),
            t = Math.tan(df / 4),
            hx = 4 / 3 * rx * t,
            hy = 4 / 3 * ry * t,
            m1 = [x1, y1],
            m2 = [x1 + hx * s1, y1 - hy * c1],
            m3 = [x2 + hx * s2, y2 - hy * c2],
            m4 = [x2, y2];
        m2[0] = 2 * m1[0] - m2[0];
        m2[1] = 2 * m1[1] - m2[1];
        if (recursive) {
            return [m2, m3, m4].concat(res);
        } else {
            res = [m2, m3, m4].concat(res).join().split(",");
            var newres = [];
            for (var i = 0, ii = res.length; i < ii; i++) {
                newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
            }
            return newres;
        }
    }

//simplify complex paths with H and V, S, Q, T, A
normalize = function(svgArr) {
  for(var a = 0; a < svgArr.length; a++){
      if(svgArr[a][0] == "H"){
          svgArr[a][0] = "L";
          if(svgArr[a-1][0] == 'C')
              svgArr[a][2] = svgArr[a-1][6];
          else
              svgArr[a][2] = svgArr[a-1][2];
      }
      else if(svgArr[a][0] == "V"){
          svgArr[a][0] = "L";
          svgArr[a][2] = svgArr[a][1];
          if(svgArr[a-1][0] == 'C')
              svgArr[a][1] = svgArr[a-1][5];
          else
              svgArr[a][1] = svgArr[a-1][1];
      }
      else if(svgArr[a][0] == "S"){
          svgArr[a][0] = 'C';
          svgArr[a][5] = svgArr[a][3];
          svgArr[a][6] = svgArr[a][4];
          if(svgArr[a-1][0] != 'M'){
              svgArr[a][3] = svgArr[a][1];
              svgArr[a][4] = svgArr[a][2];
              svgArr[a][1] = svgArr[a-1][5] + svgArr[a-1][5] - svgArr[a-1][3];
              svgArr[a][2] = svgArr[a-1][6] + svgArr[a-1][6] - svgArr[a-1][4];
          }
          else{
              svgArr[a][3] = svgArr[a-1][1];
              svgArr[a][4] = svgArr[a-1][2];
              svgArr[a][1] = svgArr[a-1][1];
              svgArr[a][2] = svgArr[a-1][2];
          }
      }
      else if(svgArr[a][0] == "Q"){
          svgArr[a][0] = 'C';
          svgArr[a][5] = svgArr[a][3];
          svgArr[a][6] = svgArr[a][4];
          svgArr[a][3] = svgArr[a][1] * 2/3 + svgArr[a][5] * 1/3;
          svgArr[a][4] = svgArr[a][2] * 2/3 + svgArr[a][6] * 1/3;
          svgArr[a][1] = svgArr[a][1] * 2/3 + svgArr[a-1][svgArr[a-1].length-2] * 1/3;
          svgArr[a][2] = svgArr[a][2] * 2/3 + svgArr[a-1][svgArr[a-1].length-1] * 1/3;
      }
      else if(svgArr[a][0] == "T"){
          svgArr[a][0] = 'C';
          svgArr[a][5] = svgArr[a][1];
          svgArr[a][6] = svgArr[a][2];
          if(svgArr[a-1][0] != 'M'){
              svgArr[a][1] = svgArr[a-1][5] + svgArr[a-1][5] - svgArr[a-1][3];
              svgArr[a][2] = svgArr[a-1][6] + svgArr[a-1][6] - svgArr[a-1][4];
              svgArr[a][3] = svgArr[a][5] * 1/3 + svgArr[a][1] - svgArr[a-1][5] / 3;
              svgArr[a][4] = svgArr[a][6] * 1/3 + svgArr[a][2] - svgArr[a-1][6] / 3;
          }
          else{
              svgArr[a][1] = svgArr[a-1][1]
              svgArr[a][2] = svgArr[a-1][2]
              svgArr[a][3] = svgArr[a-1][1]
              svgArr[a][4] = svgArr[a-1][2]
          } 
      }
      else if(svgArr[a][0] == "A"){
          var x = svgArr[a-1][svgArr[a-1].length-2],
              y = svgArr[a-1][svgArr[a-1].length-1];
          var temp = a2c.apply(0, [x, y].concat(svgArr[a].slice(1)));
          svgArr.splice(a,1);
          for(var i = 0; i < temp.length; i = i + 6)
              svgArr.splice(a + (Math.floor(i/6)), 0, ['C', temp[i], temp[i+1], temp[i+2], temp[i+3], temp[i+4], temp[i+5] ]);
      }
  }
  return svgArr;
}


export { 
  circleParams, ellipseParams, 
  turnCW, turnCCW, pointByAngleDistance, getAngle,
  distance, angleDiff, angleDiffCW, angleDiffCCW, rotatePoint,
  circleToPath, ellipseToPath, rectToPath, lineToPath, polylineToPath, polygonToPath,
  normalize,
  linesIntersection
};


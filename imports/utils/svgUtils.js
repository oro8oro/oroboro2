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


ellipseToCPath = function ellipseToCPath(ellipse){
    var rx = ellipse.rh, ry = ellipse.rv
    var x = ellipse.x, y= ellipse.y;
    if(!x) {
        x = ellipse.cx - rx
        y = ellipse.cy - ry
    }
    var w = rx*2, h = ry*2;
    var delta = 4 * (Math.sqrt(2) - 1) / 3;
    var points = [
        'M', x+w/2, y,
        'C', x+w/2+rx*delta, y, x+w, y+h/2 -ry*delta, x+w, y+h/2,
        'C', x+w, y+h/2+ry*delta, x+w/2+rx*delta, y+h, x+w/2, y+h,
        'C', x+w/2-rx*delta, y+h, x, y+h/2+ry*delta, x, y+h/2,
        'C', x, y+h/2-ry*delta, x+w/2-rx*delta, y, x+w/2, y,
        'Z'
    ]
    return points;
}

rectToPath = function rectToPath(rect){
    var x = rect.x(), y= rect.y(), w = rect.width(), h = rect.height();
    var params = {width: w, height: h, x: x, y: y, callback: rectToPath};
    if(rect.attr("rx")){
        var rx = Number(rect.attr("rx"));
        var ry = Number(rect.attr("ry"));
        var delta = 4 * (Math.sqrt(2) - 1) / 3;
        var points =
            'M'+ x + ' ' + (y+ry)
                + 'C' + x + ' ' + (y+ry-ry*delta) + ',' + (x+rx-rx*delta) + ' ' + y + ','
                + (x+rx) + ' ' + y + 'L'
                + (x+w-rx) + ' ' + y
                + 'C' + (x+w-rx+rx*delta) + ' ' + y + ',' + (x+w) + ' ' + (y+ry-ry*delta) + ','
                + (x+w) + ' ' + (y+ry) + 'L'
                + (x+w) + ' ' + (y+h-ry)
                + 'C' + (x+w) + ' ' + (y+h-ry+ry*delta) + ',' + (x+w-rx+rx*delta) + ' ' + (y+h) + ','
                + (x+w-rx) + ' ' + (y+h) + 'L'
                + (x+rx) + ' ' + (y+h)
                + 'C' + (x+rx-rx*delta) + ' ' + (y+h) + ',' + x + ' ' + (y+h-ry+ry*delta) + ','
                + x + ' ' + (y+h-ry) + 'Z';
        params.rx = rx;
        params.ry = ry;
        var type = "complex_path";
    }
    else{
        var points = [ [ [x,y], [x+w,y], [x+w,y+h], [x,y+h] ] ];
        points =  JSON.stringify(points);
        var type = "simple_path";
    }
    return {pointList: points, type: type, parameters: params};
}

lineToPath = function lineToPath(line){
    var points = [ [ [line.attr("x1"), line.attr("y1")], [line.attr("x2"), line.attr("y2")] ] ];
    return JSON.stringify(points);
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

export { getAngle, pointByAngleDistance };
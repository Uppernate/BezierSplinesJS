// JavaScript source code

function GetClassType(o) {
	if (o.constructor && o.constructor.name) 
		return o.constructor.name;
	else
		return typeof o;
}

class Point extends Vector2 {
	constructor(x, y) {
		super(x, y);
	}
	draw(ctx, colour) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.fillStyle = colour || "#5454a8";
		ctx.beginPath();
		ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
		ctx.fill();
	}
}

class Line {
	constructor(p1, p2) {
		if (p1 instanceof Point && p2 instanceof Point) {
			this.start = p1;
			this.end = p2;
		}
		else {
			throw('Attempt to construct Line class without points');
		}
	}
	draw(ctx, colour, thicc) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.strokeStyle = colour || "#403a5c";
		ctx.lineWidth = thicc || 1;
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.lineTo(this.end.x, this.end.y);
		ctx.stroke();
	}
}

class Bezier {
	constructor(start, end, control1, control2) {
		if (!(start instanceof Point)) throw(`Attempt to construct Bezier class with ${GetClassType(start)} as start parameter.`);
		if (!(end instanceof Point)) throw(`Attempt to construct Bezier class with ${GetClassType(end)} as end parameter.`);
		if (!(control1 instanceof Point)) throw(`Attempt to construct Bezier class with ${GetClassType(control1)} as control1 parameter.`);
		if (!(control2 instanceof Point)) throw(`Attempt to construct Bezier class with ${GetClassType(control2)} as control2 parameter.`);
		this.start = start;
		this.end = end;
		this.control1 = control1;
		this.control2 = control2;
	}
	draw(ctx, colour, thicc) {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.strokeStyle = colour || "#403a5c";
		ctx.lineWidth = thicc || 1;
		ctx.beginPath();
		ctx.moveTo(this.start.x, this.start.y);
		ctx.bezierCurveTo(this.control1.x, this.control1.y, this.control2.x, this.control2.y, this.end.x, this.end.y);
		ctx.stroke();
		new Line(this.start, this.control1).draw(ctx, "#696969", 2);
		new Line(this.control1, this.control2).draw(ctx, "#696969", 2);
		new Line(this.control2, this.end).draw(ctx, "#696969", 2);
	}
	drawPoints(ctx) {
		this.start.draw(ctx);
		this.end.draw(ctx);
		this.control1.draw(ctx);
		this.control2.draw(ctx);
	}
	getPointAt(t, colour) {
		const initialA = this.start.copy();
		const initialB = this.control1.copy();
		const initialC = this.control2.copy();
		initialA.lerp(this.control1, t);
		initialB.lerp(this.control2, t);
		initialC.lerp(this.end, t);
		const secondaryA = initialA.copy();
		const secondaryB = initialB.copy();
		secondaryA.lerp(initialB, t);
		secondaryB.lerp(initialC, t);

		//initialA.draw(ctx, colour || "#e72727");
		//initialB.draw(ctx, colour || "#e72727");
		//initialC.draw(ctx, colour || "#e72727");
		if (colour) {
			secondaryA.draw(ctx, colour || "#e79827");
			secondaryB.draw(ctx, colour || "#e79827");
		}
		const final = secondaryA.copy();
		final.lerp(secondaryB, t);
		//const tangent = secondaryB.copy().sub(final);
		//final.draw(ctx, "#315dff");
		return [final, secondaryA, secondaryB];
	}
	// Hell
	truncate(cutStart, cutEnd) {
		// Order min and max, as parameters may not be in order
		const tmin = Math.min(cutStart, cutEnd);
		const tmax = Math.max(cutStart, cutEnd);
		// Both values can't total more than 100% of the curve, cause you can't cut more than there physically is.
		if (tmin + (1-tmax) > 1)
			throw('Invalid parameters, cannot cut more than a total of 100% of the curve');

		/// First truncate the curve at the start
		// First bezier's points, keep in mind that this is an array of 3 points:
		// B0P0[0] = The point on the curve 
		// B0P0[1] = algorithm's last interpolation line, its beginning
		// B0P0[2] == algorithm's last interpolation line, its ending
		// Assume the same array from any this.getPointAt
		const B0P0 = this.getPointAt(tmin);
		const B0P1 = this.getPointAt(1);

		/// First bezier's tangents or control points
		// T1 = Control point 1 (or start point's control)
		// T2 = Control point 2 (or end point's control)
		// T2's strength reduced proportional to line cut
		const B0T1 = B0P0[2];
		const B0T2 = B0P1[1].sub(B0P1[0]).mul(1 - tmin).add(B0P1[0]);

		// First Bezier created with above points
		const B1 = new Bezier(B0P0[0], B0P1[0], B0T1, B0T2);

		// End truncation needs to be transformed from "full line" scale, to "cut line" scale
		// E.g. The line is originally 100 pixels. You want to cut 20% of it from the start and end. That's 20 pixels each end.
		// But as we cut it once, 100 pixels became 80, now that other 20% cut means 16 pixels and not 20.
		// That 20% now needs to be increased so it still translates to 20 pixels. In this case, it'd be 25%.
		const u = 1 - (1 - tmax) / (1 - tmin);
		// The start stays the same, now the end is cut
		const B1P0 = B1.getPointAt(0);
		const B1P1 = B1.getPointAt(u);

		// The start tangent/control point is reduced proportional to how much end was cut.
		const B1T1 = B1P0[2].sub(B1P0[0]).mul(u).add(B1P0[0]);
		const B1T2 = B1P1[1];
		// Final bezier can be created
		const B2 = new Bezier(B1P0[0], B1P1[0], B1T1, B1T2);
		// and drawn
		B2.draw(ctx, "#42c33f", 6);

		B0P0[0].draw(ctx, "#5656ff");
		B1P1[0].draw(ctx, "#ff7256");
		return B2;
	}
}
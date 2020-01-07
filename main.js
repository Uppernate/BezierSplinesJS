// JavaScript source code
const canvas = document.getElementById('draw');
canvas.width = 800;
canvas.height = 1200;
const ctx = canvas.getContext('2d');

const p = new Point(73*2, 370*2);
const b = new Bezier(
	p,
	new Point(338*2, 262*2),
	//new Point(205*2, 155*2),
	new Point(205*2, 500*2),
	new Point(338*2, 50*2)
);
//b.draw(ctx);
//b.drawPoints(ctx);
//b.getPointAt(0.5);

let t = 0.195;
let t2 = 0.805;

function loop(timestamp) {
	const progress = (timestamp - lastRender) * 0.001;
	//t = Math.sin(timestamp * 0.001) * 0.25 + 0.25;
	//t2 = Math.sin(timestamp * 0.001) * 0.25 + 0.75;

	t = Math.sin(timestamp * 0.0003) * 0.5 + 0.5;
	t2 = Math.cos(timestamp * 0.0003) * 0.5 + 0.5;

	//t = Math.sin(timestamp * 0.001) * 0.5 + 0.5;
	//t2 = 1;

	//t = 0;
	//t2 = Math.sin(timestamp * 0.001) * 0.5 + 0.5;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	b.truncate(t, t2);
	b.draw(ctx);
	b.drawPoints(ctx);

	lastRender = timestamp
	window.requestAnimationFrame(loop)
}

let lastRender = 0

window.requestAnimationFrame(loop)
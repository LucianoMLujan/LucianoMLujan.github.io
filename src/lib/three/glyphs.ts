import * as THREE from "three";

/**
 * Genera (y cachea) una textura con una palabra (por ejemplo, una habilidad
 * técnica) para usarla en sprites.
 */
const textureCache = new Map<string, THREE.CanvasTexture>();

const FONT_SIZE = 64;
const PADDING = 26;
const PIXEL_RATIO = 2;

export function createGlyphTexture(
	text: string,
	color = "#a78bfa",
): THREE.CanvasTexture {
	const key = `${text}:${color}`;
	const cached = textureCache.get(key);
	if (cached) return cached;

	const font = `700 ${FONT_SIZE}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;

	// Medimos el texto para que el canvas tenga el ancho justo y no se recorte.
	const measureCanvas = document.createElement("canvas");
	const measureContext = measureCanvas.getContext("2d");
	measureContext!.font = font;
	const textWidth = Math.ceil(measureContext!.measureText(text).width);

	const width = textWidth + PADDING * 2;
	const height = FONT_SIZE + PADDING * 2;

	const canvas = document.createElement("canvas");
	canvas.width = Math.ceil(width * PIXEL_RATIO);
	canvas.height = Math.ceil(height * PIXEL_RATIO);

	const context = canvas.getContext("2d");
	if (context) {
		context.scale(PIXEL_RATIO, PIXEL_RATIO);
		context.font = font;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = color;
		context.shadowColor = color;
		context.shadowBlur = 10;

		const x = width / 2;
		const y = height / 2 + FONT_SIZE * 0.04;

		// Dos pasadas para intensificar el glow.
		context.fillText(text, x, y);
		context.fillText(text, x, y);
	}

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.needsUpdate = true;
	textureCache.set(key, texture);
	return texture;
}

/**
 * Crea un sprite manteniendo la proporción real del texto.
 * `height` está expresado en unidades del mundo 3D.
 */
export function createGlyphSprite(
	text: string,
	color: string,
	height = 1,
): THREE.Sprite {
	const texture = createGlyphTexture(text, color);
	const image = texture.image as HTMLCanvasElement;
	const aspect = image.width / image.height;

	const material = new THREE.SpriteMaterial({
		map: texture,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
	});

	const sprite = new THREE.Sprite(material);
	sprite.scale.set(height * aspect, height, 1);
	return sprite;
}

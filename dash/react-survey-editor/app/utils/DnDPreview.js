//const Image = require('Image');

function getTextWidth(ctx, style, text) {
  if (typeof ctx.measureText === 'function') {
    return ctx.measureText(text).width
  } else {
    const perCharWidth = style.fontSize / 1.7
    return text.length * perCharWidth
  }
}

function parseBoxShadow(style) {
  const parts = (style.boxShadow || '').replace(/px/g, '').split(/[^,] /)
  const offsetX = parts[0]
  const offsetY = parts[1]
  const blur = parts[2]
  const color = parts[3]
  return {
    shadowBlur: parseInt(blur, 10) || 0,
    shadowColor: color || 'transparent',
    shadowOffsetX: parseInt(offsetX, 10) || 0,
    shadowOffsetY: parseInt(offsetY, 10) || 0
  }
}

const defaultStyle = {
  backgroundColor: '#efefef',
  borderColor: '#1a1a1a',
  color: '#1a1a1a',
  fontSize: 14,
  paddingTop: 5,
  paddingRight: 5,
  paddingBottom: 5,
  paddingLeft: 5
}

export default function createDragPreview(text, style, img) {
  if (!text) text = '...'

  if (!style) style = defaultStyle

  if (!img) img = new Image()

  const shadowStyle = parseBoxShadow(style)
  const marginBottom = shadowStyle.shadowOffsetY + (shadowStyle.shadowBlur * 2)
  const marginRight = shadowStyle.shadowOffsetX + (shadowStyle.shadowBlur * 2)
  const rectHeight = style.paddingTop + style.fontSize + style.paddingBottom
  const rectStrokeWidth = 1

  const c = document.createElement('canvas')
  c.height = rectHeight + marginBottom
  const ctx = c.getContext('2d')

  ctx.font = style.fontSize + 'px sans-serif' // once before for measurement
  const textWidth = getTextWidth(ctx, style, text)
  const rectWidth = style.paddingLeft + textWidth + style.paddingRight

  ctx.canvas.width = style.paddingLeft + textWidth + style.paddingRight + marginRight + (rectStrokeWidth * 2)
  ctx.font = style.fontSize + 'px sans-serif' // once after for actually styling

  ctx.rect(0, 0, rectWidth, rectHeight)

  ctx.save()
  ctx.fillStyle = style.backgroundColor
  ctx.strokeStyle = style.borderColor
  ctx.shadowColor = shadowStyle.shadowColor
  ctx.shadowBlur = shadowStyle.shadowBlur
  ctx.shadowOffsetX = shadowStyle.shadowOffsetX
  ctx.shadowOffsetY = shadowStyle.shadowOffsetY
  ctx.fill()
  ctx.stroke()
  ctx.restore()

  ctx.fillStyle = style.color
  ctx.fillText(text, style.paddingLeft, (style.paddingTop * .75) + style.fontSize);

  img.src = c.toDataURL()

  return img
}

# Resprite artwork from Android

On your Galaxy S23 Ultra, draw in Resprite with the S Pen. If you want to reserve drawing for the pen, enable **Pencil Draw Only**. Pressure-based brush sizing is available under **Preferences → Mouse & Stylus** on supported Resprite Android versions. The finished artwork reaches Godot as image pixels. [Resprite stylus and gesture settings](https://resprite.fengeon.com/docs/basic/gesture)

## Export from Resprite

- **Still sprites, props and tiles.** Export a PNG with transparent background and keep it at its original pixel dimensions (1×).
- **Animations.** Export a **Sprite Sheet (PNG)** as a regular grid of equal-sized frames. Keep the full frame canvas so an actor stays aligned across frames. Include the cell width, cell height, frame order and timing when handing it off. Separate PNG frames with matching canvas sizes also work.
- **Editable originals.** Keep the `.resprite` project with its layers and timeline for later edits. Transfer the PNGs through Files, USB or cloud storage as original files.

[Resprite export options](https://resprite.fengeon.com/docs/basic/export)

## Bring it into Godot

Copy the PNG into the project's `art/` directory and let Godot import it as a texture. Use **Lossless** compression and leave mipmaps off for normal pixel sprites. The project already uses nearest-neighbor texture filtering. For a replacement, match the existing sprite's pixel dimensions, frame layout and alignment. For a new animation, select cells from the sheet in a **SpriteFrames** resource or assign the regions as atlas textures. Assign the new texture or animation to its intended scene, sprite, or tileset before building the game.

[Godot image import settings](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_images.html)

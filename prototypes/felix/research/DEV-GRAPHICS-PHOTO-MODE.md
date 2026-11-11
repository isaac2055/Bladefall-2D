# Graphics Lab Photo mode

Launch Bladefall or Felix with Graphics Lab enabled. Pause in a room, expand **Graphics Lab**, and choose **Photo mode**.

Use the zoom slider for 1× to 3× framing. Drag the image or use the horizontal and vertical sliders to move the crop. **Reset framing** restores the whole world viewport. F8 compares with the selected Original or Favorite reference, and F9 cycles the current look. **Back to pause** and Escape return to the pause panel.

Choose **Pin current look**, then switch the live look with F8 or F9. The **Wipe** slider controls how much of the frame shows the pin on the left and the live look on the right. Zoom and pan apply to both sides. **Save PNG** includes the comparison but leaves out the preview divider. Use **Clear pinned look** to return to single-look photos.

**Save PNG** captures only the framed world. The preview and file use the current world render scale and retain the source pixel resolution, so a crop or Half render scale yields a smaller PNG. Full render scale gives a 1280 × 736 uncropped PNG. In native builds photos go to `user://photos`, accessible through **Open photo folder**. In browser builds Save PNG starts a download.

Photo mode crops the rendered texture in place. The game camera, player, checkpoint and simulation frame stay fixed. Closing the panel restores the pause menu so play resumes through the normal controls.

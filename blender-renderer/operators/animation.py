"""Modal animation operator for smooth piece movements."""

import time

import bpy
from bpy.types import Operator

from ..constants import ANIMATION_DURATION_SECONDS, ANIMATION_ARC_HEIGHT
from ..utils import edge_targets
from .helpers import pending_anims


class BLCHESS_OT_animate_move(Operator):
    """Modal operator that smoothly slides all moved pieces simultaneously."""

    bl_idname = "blchess.animate_move"
    bl_label = "Animate Move"
    bl_options = {"INTERNAL"}

    _timer = None
    _start_time: float = 0.0
    _duration: float = ANIMATION_DURATION_SECONDS
    # List of dicts: {piece_name, start_loc, end_loc, arc_height} — one per piece object
    _animations: list = []

    _tick_count: int = 0

    def modal(self, context, event):
        if event.type != "TIMER":
            return {"PASS_THROUGH"}

        elapsed = time.time() - self._start_time
        t = min(elapsed / self._duration, 1.0)
        ease = t * t * (3.0 - 2.0 * t)

        log_this_tick = self._tick_count % 10 == 0
        self._tick_count += 1

        for anim in self._animations:
            obj = bpy.data.objects.get(anim["piece_name"])
            if obj is None:
                if log_this_tick:
                    with open("/tmp/blchess_modal.txt", "a") as f:
                        f.write(f"MISSING: {anim['piece_name']}\n")
                continue
            sx, sy, sz = anim["start_loc"]
            ex, ey, ez = anim["end_loc"]
            arc = anim.get("arc_height", ANIMATION_ARC_HEIGHT)
            x = sx + ease * (ex - sx)
            y = sy + ease * (ey - sy)
            z = sz + ease * (ez - sz) + arc * 4.0 * t * (1.0 - t)
            obj.location = (x, y, z)
            if log_this_tick:
                with open("/tmp/blchess_modal.txt", "a") as f:
                    f.write(f"t={t:.2f} {obj.name} loc={tuple(obj.location)}\n")

            # Update any edge curve endpoints that connect to this square
            square = anim.get("square")
            if square:
                for curve_obj, pt_idx in edge_targets.get(square, []):
                    spline = curve_obj.data.splines[0]
                    w = spline.points[pt_idx].co[3]
                    spline.points[pt_idx].co = (x, y, 0.0, w)

        for area in context.screen.areas:
            if area.type == "VIEW_3D":
                area.tag_redraw()

        return self._finish(context) if t >= 1.0 else {"RUNNING_MODAL"}

    def execute(self, context):
        if not pending_anims:
            return {"CANCELLED"}

        self._animations = list(pending_anims)
        pending_anims.clear()
        self._duration = float(
            self._animations[0].get("duration", ANIMATION_DURATION_SECONDS)
        )

        # Rewind all pieces to their start positions before the timer fires
        for anim in self._animations:
            obj = bpy.data.objects.get(anim["piece_name"])
            if obj is not None:
                obj.location = anim["start_loc"]

        self._start_time = time.time()
        self._tick_count = 0
        print(
            f"[anim] modal: animating {len(self._animations)} objects over {self._duration}s"
        )

        wm = context.window_manager
        self._timer = wm.event_timer_add(1.0 / 30.0, window=context.window)
        wm.modal_handler_add(self)
        return {"RUNNING_MODAL"}

    def _finish(self, context):
        context.window_manager.event_timer_remove(self._timer)
        self._timer = None
        self._animations = []
        return {"FINISHED"}

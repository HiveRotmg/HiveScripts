import { Hive, Panel } from '@hive/sdk';

const STEP_DISTANCE = 1;
const LOOP_DELAY_MS = 1000;

export default class DirectionalMovement {
  panel = null;

  onStart() {
    Hive.ui.status('Directional controls ready');

    this.panel = Hive.ui.panel.define({
      title: 'Directional Movement',
      subtitle: 'Move one tile per click',
      width: 360,
      autoOpen: true,
      widgets: [
        Panel.row([
          Panel.button({
            id: 'move-up',
            label: 'Up',
            onClick: () => this.move(0, -STEP_DISTANCE),
          }),
        ]),
        Panel.row([
          Panel.button({
            id: 'move-left',
            label: 'Left',
            onClick: () => this.move(-STEP_DISTANCE, 0),
          }),
          Panel.button({
            id: 'move-down',
            label: 'Down',
            onClick: () => this.move(0, STEP_DISTANCE),
          }),
          Panel.button({
            id: 'move-right',
            label: 'Right',
            onClick: () => this.move(STEP_DISTANCE, 0),
          }),
        ]),
      ],
    });
  }

  onLoop() {
    return LOOP_DELAY_MS;
  }

  onStop() {
    const position = Hive.self.getPosition();
    Hive.walking.walkTo(position.x, position.y);
    Hive.ui.status(null);
    this.panel = null;
  }

  move(deltaX, deltaY) {
    const position = Hive.self.getPosition();
    Hive.walking.walkTo(position.x + deltaX, position.y + deltaY);
  }
}

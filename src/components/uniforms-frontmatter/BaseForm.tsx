import { BaseForm } from 'uniforms';

function Unstyled(parent: any) {
  class _ extends parent {
    static Unstyled = Unstyled;

    static displayName = `Unstyled${parent.displayName}`;
  }

  return _ as unknown as typeof BaseForm;
}

export default Unstyled(BaseForm);

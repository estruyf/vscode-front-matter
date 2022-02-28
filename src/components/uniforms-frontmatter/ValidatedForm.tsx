import { ValidatedForm } from 'uniforms';

import BaseForm from './BaseForm';

function Validated(parent: any) {
  class _ extends ValidatedForm.Validated(parent) {
    static Validated = Validated;
  }

  return _ as unknown as ValidatedForm;
}

export default Validated(BaseForm);

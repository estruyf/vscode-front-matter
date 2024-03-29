/* eslint-disable class-methods-use-this */
import { QuickForm } from 'uniforms';

import AutoField from './AutoField';
import BaseForm from './BaseForm';
import ErrorsField from './ErrorsField';
import SubmitField from './SubmitField';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Quick(parent: any) {
  class _ extends QuickForm.Quick(parent) {
    static Quick = Quick;

    getAutoField() {
      return AutoField;
    }

    getErrorsField() {
      return ErrorsField;
    }

    getSubmitField() {
      return SubmitField;
    }
  }

  return _ as unknown as QuickForm;
}

export default Quick(BaseForm);

import { AutoForm } from 'uniforms';

import ValidatedQuickForm from './ValidatedQuickForm';

function Auto(parent: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  class _ extends AutoForm.Auto(parent as any) {
    static Auto = Auto;
  }

  return _ as unknown as AutoForm;
}

export default Auto(ValidatedQuickForm);

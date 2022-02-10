import BaseForm from './BaseForm';
import QuickForm from './QuickForm';
import ValidatedForm from './ValidatedForm';

export default ValidatedForm.Validated(QuickForm.Quick(BaseForm));

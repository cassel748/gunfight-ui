Example usage:

const ValidationSchema = Yup.object().shape({
  initialDate: Yup.string().required("Data Inicial é obrigatório")
});

const handleFieldChange = (field, event) => {
  const value = event.target.value;
  formik.setFieldValue(field, value)
};

<InputDate
  label="Data Início"
  onChange={event => handleFieldChange('initialDate', event)}
  value={formik.values.initialDate}
  error={Boolean(touched.initialDate && errors.initialDate)}
  helperText={touched.initialDate && errors.initialDate}
/>
// src/components/validationSchema.js
import * as yup from 'yup';

export default yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Must be a valid email').required('Email is required'),
  phone: yup
    .string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number')
    .required('Phone is required'),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  region: yup.string().required('Region is required'),
  farmSize: yup
    .number()
    .typeError('Farm size must be a number')
    .positive('Farm size must be positive')
    .required('Farm size is required'),
  farmType: yup.string().oneOf(['crop','livestock','mixed'], 'Select farm type').required('Farm type is required'),
  crops: yup.string().optional(),
  acceptTerms: yup.boolean().oneOf([true], 'You must accept the terms').required(),
});

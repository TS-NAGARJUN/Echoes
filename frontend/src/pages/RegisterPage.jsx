/**
 * @file pages/RegisterPage.jsx
 * @description Split-layout register page with chat illustration
 */

import SplitLayout from '../components/Auth/SplitLayout';
import RegisterFormContent from '../components/Auth/RegisterFormContent';
import { loginPageCSS } from '../components/Auth/styles/LoginPageStyles';

const RegisterPage = () => {
  return (
    <>
      <style>{loginPageCSS}</style>
      <SplitLayout>
        <RegisterFormContent />
      </SplitLayout>
    </>
  );
};

export default RegisterPage;

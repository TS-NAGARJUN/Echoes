/**
 * @file pages/LoginPage.jsx
 * @description Split-layout login page with chat illustration
 */

import SplitLayout from '../components/Auth/SplitLayout';
import LoginFormContent from '../components/Auth/LoginFormContent';
import { loginPageCSS } from '../components/Auth/styles/LoginPageStyles';

const LoginPage = () => {
  return (
    <>
      <style>{loginPageCSS}</style>
      <SplitLayout>
        <LoginFormContent />
      </SplitLayout>
    </>
  );
};

export default LoginPage;

/**
 * @file components/Auth/SplitLayout.jsx
 * @description Two-column layout with chat on left, form on right
 */

import LoginBrand from './LoginBrand';
import ChatStage from './ChatStage';
import ChatTagline from './ChatTagline';

const SplitLayout = ({ children }) => {
  return (
    <div className="lp-root">
      {/* Left Panel - Chat Illustration */}
      <div className="lp-left">
        <div className="lp-left-bg" />
        <div className="lp-grid-lines" />

        <LoginBrand />

        <ChatStage />

        <ChatTagline />
      </div>

      {/* Right Panel - Form */}
      <div className="lp-right">
        {children}
      </div>
    </div>
  );
};

export default SplitLayout;

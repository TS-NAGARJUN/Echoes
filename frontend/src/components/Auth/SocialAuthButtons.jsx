/**
 * @file components/Auth/SocialAuthButtons.jsx
 * @description Social authentication buttons for login/register
 */

import { IconGoogle, IconGithub, IconTwitter } from './icons';

const SocialAuthButtons = () => {
  const handleSocialAuth = (provider) => {
    // TODO: Implement social authentication
    console.log(`Social auth with ${provider}`);
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => handleSocialAuth('google')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <IconGoogle />
        </button>

        <button
          type="button"
          onClick={() => handleSocialAuth('github')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <IconGithub />
        </button>

        <button
          type="button"
          onClick={() => handleSocialAuth('twitter')}
          className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <IconTwitter />
        </button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
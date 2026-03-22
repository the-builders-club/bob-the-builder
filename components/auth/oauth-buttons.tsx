'use client';

import { signInWithGithub, signInWithGoogle } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { GithubIcon, GoogleIcon } from '@/components/ui/icons';

export function OAuthButtons() {
  return (
    <div className="flex flex-col gap-3">
      <form action={signInWithGithub}>
        <Button
          type="submit"
          className="h-11 w-full bg-zinc-900 text-white hover:bg-zinc-700"
        >
          <GithubIcon />
          Continue with GitHub
        </Button>
      </form>
      <form action={signInWithGoogle}>
        <Button type="submit" variant="outline" className="h-11 w-full">
          <GoogleIcon />
          Continue with Google
        </Button>
      </form>
    </div>
  );
}

import { Button } from '~/components/ui/button';
import type { Route } from './+types/home';

// import voices from '~/lib/preferred-voices.json';

import { PauseCircleIcon, PlayCircleIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useSpeechSynthesis } from '~/contexts/speech-context';
import { cn } from '~/lib/utils';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const {
    voices,
    selectedVoice,
    onChangeVoice,
    isSpeaking,
    onStartSpeaking,
    onStopSpeaking,
    isTransition,
  } = useSpeechSynthesis();

  const posts = [
    {
      id: '1',
      title: 'Welcome to Remix',
      content: 'This is a simple example of a Remix application.',
    },
    {
      id: '2',
      title: 'Understanding Remix',
      content:
        'Remix is a modern React framework for building web applications.',
    },
    {
      id: '3',
      title: 'Getting Started with Remix',
      content:
        'To get started with Remix, you can follow the official documentation.',
    },
    {
      id: '4',
      title: 'Advanced Remix Features',
      content:
        'Remix offers advanced features like data loading, caching, and more.',
    },
  ];

  return (
    <main className={'container mx-auto max-w-[85em] py-4 px-4 2xl:px-0'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button disabled={isTransition} variant='outline'>
            {selectedVoice?.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-fit max-h-96' align='start'>
          <DropdownMenuLabel>Preferred Voices</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {voices.map((voice) => (
            <DropdownMenuItem
              key={voice.voiceURI}
              onSelect={() => onChangeVoice(voice)}>
              {voice.name} ({voice.lang})
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
      <section className={'text-center'}>
        <h1 className={'text-3xl text-center font-semibold'}>React Article</h1>
        {posts.map((post) => (
          <Card key={post.id} className='my-4'>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>{post.content}</CardContent>
            <CardFooter className={'w-full'}>
              <Button
                className={cn(
                  'w-full',
                  isSpeaking
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 text-white'
                )}
                onClick={
                  isSpeaking
                    ? onStopSpeaking
                    : () => onStartSpeaking(JSON.stringify(post.content))
                }
                type='button'
                aria-pressed={isSpeaking}
                aria-label={isSpeaking ? 'Stop reading' : 'Play reading'}>
                {/* Icon: Play when idle, Stop when speaking */}
                <span
                  aria-hidden='true'
                  style={{
                    marginRight: '0.5em',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}>
                  {isSpeaking ? (
                    <PlayCircleIcon className={'size-4'} />
                  ) : (
                    <PauseCircleIcon className={'size-4'} />
                  )}
                </span>
                {/* Button label */}
                {isSpeaking ? 'Stop' : 'Speak'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </main>
  );
}

import APITester from '../components/APITester';
import BlogTranslator from '../components/BlogTranslator';

const sampleBlogContent = `Welcome to our amazing blog about web technologies! 

In this post, we'll explore the fascinating world of modern web APIs that are revolutionizing how we build applications. The Web Platform is constantly evolving, bringing us new capabilities that were once only possible in native applications.

Today, we're particularly excited about the Translation API and Language Detection API. These powerful tools allow developers to create truly multilingual experiences without relying on external services.

The Translation API enables real-time translation of text content, while the Language Detection API can automatically identify the language of any given text. Together, they open up incredible possibilities for creating accessible, global applications.

Whether you're building a content management system, a social media platform, or an e-commerce site, these APIs can help you reach a global audience more effectively than ever before.

Stay tuned for more exciting updates about the future of web development!`;

export default function BlogPage() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-4'>Blog Translation Demo</h1>
        <p className='text-gray-600'>
          This page demonstrates automatic language detection and translation of
          blog content using the browser's built-in Translation and Language
          Detection APIs.
        </p>
      </div>

      <div className='space-y-8'>
        <APITester />

        <BlogTranslator
          blogContent={sampleBlogContent}
          title='The Future of Web APIs: Translation and Language Detection'
        />
      </div>
    </div>
  );
}

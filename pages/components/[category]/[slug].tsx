import type { NextPage } from 'next'

import Head from 'next/head'

import { Component } from '../../../interface/component'
import { FrontMatter } from '../../../interface/frontmatter'

import { componentSlugs } from '../../../lib/components'

import fs from 'fs'
import matter from 'gray-matter'
import { MDXRemote } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

import List from '../../../components/collection/list'

const components = {
  List,
}

type Props = {
  source: any
  name: string
  frontMatter: FrontMatter
}

const Component: NextPage<Props> = ({ source, name, frontMatter }) => {
  const { seo, spacing, components: items } = frontMatter

  const componentsArray: Array<Component> = Object.entries(items).map(
    ([key, value]): Component => ({
      id: key,
      title: value.title,
      spacing: value.spacing ?? false,
      variants: value.variants
        ? Object.entries(value.variants).map(
            ([key, value]: any): Component => ({
              id: key,
              title: value.title,
            })
          )
        : [],
    })
  )

  const data = {
    name,
    spacing: spacing,
    examples: componentsArray,
  }

  return (
    <>
      <Head>
        <title>Free Tailwind CSS {seo.title} | HyperUI</title>

        <meta name="description" key="description" content={seo.description} />
      </Head>

      <section>
        <div className="px-4 py-12 mx-auto max-w-screen-xl lg:pt-24">
          <div className="prose max-w-none">
            <MDXRemote {...source} components={components} scope={data} />
          </div>
        </div>
      </section>
    </>
  )
}

type Params = {
  params: {
    category: string
    slug: string
  }
}

export async function getStaticProps({ params: { category, slug } }: Params) {
  const source = fs.readFileSync(`data/components/${category}-${slug}.mdx`)

  const { content, data } = matter(source)

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [],
    },
    scope: data,
  })

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
      name: slug,
    },
  }
}

export async function getStaticPaths() {
  const paths = componentSlugs()

  return {
    paths,
    fallback: false,
  }
}

export default Component

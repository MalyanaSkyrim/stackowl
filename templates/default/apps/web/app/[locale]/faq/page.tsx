import { redirect } from '@/i18n/routing'

const FAQStubPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}) => {
  const { locale } = await params
  redirect({ href: '/#faq', locale })
}

export default FAQStubPage

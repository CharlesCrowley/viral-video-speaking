import { redirect } from 'next/navigation';

export default function LessonPage({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/lesson/${params.id}/prepare`);
}

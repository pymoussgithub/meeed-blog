import type { ActiveProject } from "@/lib/services/project.service";
import { ProjectShowcaseCard } from "./ProjectShowcaseCard";

type ProjectsShowcaseListProps = {
  projects: ActiveProject[];
};

export function ProjectsShowcaseList({ projects }: ProjectsShowcaseListProps) {
  return (
    <div className="w-full border-t border-gray-100">
      {projects.map((project, index) => (
        <ProjectShowcaseCard
          key={project.id}
          project={project}
          imageOnRight={index % 2 === 1}
        />
      ))}
    </div>
  );
}

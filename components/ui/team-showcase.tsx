import { useState } from 'react';
import { FaLinkedinIn, FaTwitter, FaBehance, FaInstagram } from 'react-icons/fa';
import { cn } from '../../lib/utils';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    behance?: string;
  };
}

/** Vorstand laut bisheriger Website rallyeclub-klostertal.at (Mitglieder). Bilder: Initialen-Placeholders. */
const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: '1',
    name: 'Christoph Schuler',
    role: 'Obmann',
    image: 'https://placehold.co/400x480/12121a/f97316?text=CS',
    social: { linkedin: 'https://www.facebook.com/132632750148150' },
  },
  {
    id: '2',
    name: 'Christian Breuss',
    role: 'Vizeobmann',
    image: 'https://placehold.co/400x480/12121a/f97316?text=CB',
    social: { linkedin: 'https://www.facebook.com/132632750148150' },
  },
  {
    id: '3',
    name: 'Martina Zögernitz',
    role: 'Schriftführerin & Kassierin',
    image: 'https://placehold.co/400x480/12121a/f97316?text=MZ',
    social: { linkedin: 'https://www.facebook.com/132632750148150' },
  },
  {
    id: '4',
    name: 'Manuel Schuler',
    role: 'Vorstand',
    image: 'https://placehold.co/400x480/12121a/f97316?text=MS',
    social: { linkedin: 'https://www.facebook.com/132632750148150' },
  },
  {
    id: '5',
    name: 'Herbert Schuler',
    role: 'Vorstand',
    image: 'https://placehold.co/400x480/12121a/f97316?text=HS',
    social: { linkedin: 'https://www.facebook.com/132632750148150' },
  },
  {
    id: '6',
    name: 'Alex Schmöllerl',
    role: 'Fahrervertreter',
    image: 'https://placehold.co/400x480/12121a/f97316?text=AS',
    social: { linkedin: 'https://www.facebook.com/132632750148150' },
  },
];

interface TeamShowcaseProps {
  members?: TeamMember[];
}

export default function TeamShowcase({ members = DEFAULT_MEMBERS }: TeamShowcaseProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="flex w-full max-w-5xl select-none flex-col items-start gap-8 px-4 py-8 font-sans md:flex-row md:gap-10 md:px-6 lg:gap-14">
      <div className="flex flex-shrink-0 gap-2 overflow-x-auto pb-1 md:gap-3 md:pb-0">
        <div className="flex flex-col gap-2 md:gap-3">
          {col1.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[120px] w-[110px] sm:h-[140px] sm:w-[130px] md:h-[165px] md:w-[155px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[48px] flex flex-col gap-2 sm:mt-[56px] md:mt-[68px] md:gap-3">
          {col2.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[132px] w-[122px] sm:h-[155px] sm:w-[145px] md:h-[182px] md:w-[172px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>

        <div className="mt-[22px] flex flex-col gap-2 sm:mt-[26px] md:mt-[32px] md:gap-3">
          {col3.map((member) => (
            <PhotoCard
              key={member.id}
              member={member}
              className="h-[125px] w-[115px] sm:h-[146px] sm:w-[136px] md:h-[172px] md:w-[162px]"
              hoveredId={hoveredId}
              onHover={setHoveredId}
            />
          ))}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col gap-4 pt-0 sm:grid sm:grid-cols-2 md:flex md:flex-col md:gap-5 md:pt-2">
        {members.map((member) => (
          <MemberRow
            key={member.id}
            member={member}
            hoveredId={hoveredId}
            onHover={setHoveredId}
          />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({
  member,
  className,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  className: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={cn(
        'flex-shrink-0 cursor-pointer overflow-hidden rounded-xl transition-opacity duration-300',
        className,
        isDimmed ? 'opacity-60' : 'opacity-100',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className="h-full w-full object-cover transition-[filter] duration-500"
        style={{
          filter: isActive ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.77)',
        }}
      />
    </div>
  );
}

function MemberRow({
  member,
  hoveredId,
  onHover,
}: {
  member: TeamMember;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial =
    member.social?.twitter ??
    member.social?.linkedin ??
    member.social?.instagram ??
    member.social?.behance;

  return (
    <div
      className={cn(
        'cursor-pointer transition-opacity duration-300',
        isDimmed ? 'opacity-50' : 'opacity-100',
      )}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'h-3 w-4 flex-shrink-0 rounded-[5px] transition-all duration-300',
            isActive ? 'w-5 bg-foreground' : 'bg-foreground/25',
          )}
        />
        <span
          className={cn(
            'text-base font-semibold leading-none tracking-tight transition-colors duration-300 md:text-[18px]',
            isActive ? 'text-foreground' : 'text-foreground/80',
          )}
        >
          {member.name}
        </span>

        {hasSocial && (
          <div
            className={cn(
              'ml-0.5 flex items-center gap-1.5 transition-all duration-200',
              isActive
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none -translate-x-2 opacity-0',
            )}
          >
            {member.social?.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground rounded p-1 transition-all duration-150 hover:scale-110"
                title="X / Twitter"
              >
                <FaTwitter size={10} />
              </a>
            )}
            {member.social?.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground rounded p-1 transition-all duration-150 hover:scale-110"
                title="Facebook"
              >
                <FaLinkedinIn size={10} />
              </a>
            )}
            {member.social?.instagram && (
              <a
                href={member.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground rounded p-1 transition-all duration-150 hover:scale-110"
                title="Instagram"
              >
                <FaInstagram size={10} />
              </a>
            )}
            {member.social?.behance && (
              <a
                href={member.social.behance}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-muted-foreground hover:bg-foreground/10 hover:text-foreground rounded p-1 transition-all duration-150 hover:scale-110"
                title="Behance"
              >
                <FaBehance size={10} />
              </a>
            )}
          </div>
        )}
      </div>

      <p className="text-muted-foreground mt-1.5 pl-[27px] text-[7px] font-medium uppercase tracking-[0.2em] md:text-[10px]">
        {member.role}
      </p>
    </div>
  );
}

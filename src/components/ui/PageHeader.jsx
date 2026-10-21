import React from 'react';
import Badge from './Badge';

export default function PageHeader({
  badge,
  badgeIcon,
  badgeVariant = 'primary',
  title,
  subtitle,
  actions,
  breadcrumbs = [],
  onBreadcrumbClick,
  className = ''
}) {
  return (
    <div className={`space-y-3 pb-2 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-[#64748B]">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-slate-300">/</span>}
                {isLast ? (
                  <span className="font-semibold text-[#0F172A]">{crumb.label}</span>
                ) : (
                  <button
                    onClick={() => onBreadcrumbClick?.(crumb.route || crumb.id)}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {crumb.label}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {badge && (
            <div className="mb-2">
              <Badge variant={badgeVariant} icon={badgeIcon}>
                {badge}
              </Badge>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

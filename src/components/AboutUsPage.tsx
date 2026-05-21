/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useDSCPS } from '../lib/state';
import { Camera, Mail, Sparkles, Award } from 'lucide-react';

export default function AboutUsPage() {
  const { boardMembers, siteConfig } = useDSCPS();

  return (
    <div id="about-us-page-view" className="w-full max-w-7xl mx-auto px-4 py-8 md:py-16">
      
      {/* Header and Story Section */}
      <div className="max-w-3xl mx-auto text-center mb-16" id="about-header-block">
        <span className="text-xs font-bold font-mono uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
          Who We Are
        </span>
        <h2 className="font-display font-bold text-3xl md:text-5xl text-white mt-4 tracking-tight leading-tight">
          Governing Board of DSCPS
        </h2>
        <p className="text-neutral-400 font-mono text-xs mt-2 italic">
          Host domain: {siteConfig.domain}
        </p>
        
        <div className="mt-6 p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl text-neutral-305 text-neutral-300 text-sm md:text-base leading-relaxed text-left">
          {siteConfig.aboutText}
        </div>
      </div>

      {/* Dynamic Board Grid */}
      <div className="text-center mb-10">
        <h3 className="font-display font-medium text-lg text-neutral-400 tracking-wider uppercase mb-6">Current Governing Board Profiles</h3>
      </div>

      {boardMembers.length === 0 ? (
        <div className="text-center p-12 bg-neutral-900/10 border border-dashed border-neutral-800 rounded-xl max-w-md mx-auto">
          <Camera className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm text-neutral-400 font-medium">No board members configured in the index.</p>
          <p className="text-xs text-neutral-500 mt-1">President and Secretary can add board profiles via the Admin Panel!</p>
        </div>
      ) : (
        <div id="board-members-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {boardMembers.map((member, mIdx) => (
            <div 
              key={member.id} 
              id={`board-member-card-${member.id}`}
              className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden hover:border-neutral-800 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Board Image with dark vintage filter overlay */}
                <div className="relative aspect-square w-full bg-neutral-900 overflow-hidden">
                  <img
                    src={member.imageUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop'}
                    alt={member.fullName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Board Hierarchy Placement */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold font-mono uppercase bg-amber-500 text-neutral-950 px-2.5 py-0.5 rounded-full shadow-md">
                      Board #{member.order || mIdx + 1}
                    </span>
                  </div>
                </div>

                {/* Info Area */}
                <div className="p-6 text-left">
                  <h4 className="font-display font-bold text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                    {member.fullName}
                  </h4>
                  
                  {/* Multiple Roles inside Board representation */}
                  <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                    {member.roles.map((role, rIdx) => (
                      <span 
                        key={rIdx} 
                        className="text-[9px] font-bold font-mono uppercase bg-neutral-900 border border-neutral-800 text-neutral-300 px-2 py-0.5 rounded"
                      >
                        {role}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed font-sans mb-4">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Achievements banner inside card footer */}
              {member.specialAchievement && (
                <div className="px-6 py-3 bg-neutral-900/40 border-t border-neutral-900/60 flex items-center space-x-2 text-xs">
                  <Award size={14} className="text-amber-500 shrink-0" />
                  <span className="text-neutral-300 font-medium truncate">{member.specialAchievement}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Code of Ethics segment */}
      <div className="mt-20 border-t border-neutral-900 pt-12 text-center" id="ethics-block">
        <h4 className="font-display font-semibold text-lg text-neutral-300 tracking-wider uppercase mb-3">Our Creative Code</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left mt-8">
          <div className="p-5 bg-neutral-900/20 border border-neutral-900 rounded-xl">
            <h5 className="font-bold text-amber-500 text-sm">Truth in Framing</h5>
            <p className="text-xs text-neutral-400 mt-2">We document reality faithfully, preserving original ambient contours while avoiding synthetic AI alterations.</p>
          </div>
          <div className="p-5 bg-neutral-900/20 border border-neutral-900 rounded-xl">
            <h5 className="font-bold text-amber-500 text-sm">Empathetic Exposure</h5>
            <p className="text-xs text-neutral-400 mt-2">Every student portrait and local capture is framed with full human respect, empathy, and creative appreciation.</p>
          </div>
          <div className="p-5 bg-neutral-900/20 border border-neutral-900 rounded-xl">
            <h5 className="font-bold text-amber-500 text-sm">Continuous Masterclass</h5>
            <p className="text-xs text-neutral-400 mt-2">Senior photographers and default chief editors actively mentor junior students on focus lock, and Lightroom pipelines.</p>
          </div>
        </div>
      </div>

    </div>
  );
}

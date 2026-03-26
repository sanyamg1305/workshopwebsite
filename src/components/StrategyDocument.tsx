import React from 'react';
import ReactMarkdown from 'react-markdown';

export const StrategyDocument = ({ state }: { state: any }) => {
  const { inputs, outputs } = state;
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Safety checks
  // Safety checks - ensure critical strategy data is present before rendering PDF
  const criticalFields = ['valueProp', 'icps', 'valuePropTables', 'gtmStrategy', 'leadMagnets'];
  const isMissingData = criticalFields.some(f => !outputs[f] || (Array.isArray(outputs[f]) && outputs[f].length === 0));
  
  if (isMissingData) {
    return (
      <div className="p-12 text-center border-4 border-dashed border-black/10 rounded-3xl m-8">
        <h2 className="text-2xl font-black uppercase mb-4 text-gray-300">Strategy Report Incomplete</h2>
        <p className="text-gray-400 font-serif italic text-sm">Please complete all 7 workshop steps to generate your full strategy asset bundle before exporting.</p>
      </div>
    );
  }

  return (
    <div className="bg-white text-black font-serif w-full max-w-[1000px] mx-auto pdf-container">
      {/* 1. COVER PAGE */}
      <div className="h-screen flex flex-col justify-center items-center text-center p-12 border-8 border-black m-8 break-after-page">
        <h1 className="text-6xl font-black mb-6 uppercase tracking-widest">{inputs.brandName || inputs.companyName || "Growth Strategy"}</h1>
        <div className="w-24 h-2 bg-black mx-auto mb-8"></div>
        <h2 className="text-3xl font-bold text-gray-800 mb-12 italic leading-relaxed max-w-2xl">
          "{outputs.valueProp}"
        </h2>
        <div className="mt-auto space-y-4">
          <p className="text-xl font-bold tracking-widest uppercase">Go-To-Market & Growth Strategy</p>
          <p className="text-lg text-gray-500">{today}</p>
          <p className="text-sm text-gray-400 mt-8 tracking-wider">GENERATED VIA AI STRATEGY WORKSHOP</p>
        </div>
      </div>

      <div className="p-12 space-y-24">
        {/* 2. EXECUTIVE SUMMARY */}
        <section className="break-after-page">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h2 className="text-4xl font-black uppercase tracking-widest">Executive Summary</h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed">
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-gray-500">What The Business Does</h3>
              <p>{inputs.offer}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-gray-500">Who We Target</h3>
              <p>{outputs.icpSummary || "Strategic Decision Makers"}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-gray-500">Core Positioning Insight</h3>
              <p>{outputs.positioningAngles || outputs.globalSolution || "Leveraging clear narrative differentiation to accelerate pipeline growth."}</p>
            </div>
            <div>
              <h3 className="font-bold uppercase tracking-wider text-sm mb-2 text-gray-500">Key Opportunity</h3>
              <p>{outputs.outreachCampaign?.strategySummary || "Systematizing outreach and inbound authority to capture demand natively."}</p>
            </div>
          </div>
        </section>

        {/* 3. IDEAL CUSTOMER PROFILES */}
        {outputs.icps && outputs.icps.length > 0 && (
          <section className="break-after-page">
            <div className="border-b-4 border-black pb-4 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-widest">Ideal Customer Profiles</h2>
            </div>
            <div className="space-y-12">
              {outputs.icps.map((icp: any, i: number) => (
                <div key={i} className="p-8 border-2 border-black">
                  <h3 className="text-2xl font-black uppercase mb-4">{icp.name}</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-2">Description</h4>
                      <p className="text-gray-800">{icp.whoTheyAre}</p>
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-2">Pain Points</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {icp.painPoints?.map((p: string, j: number) => <li key={j}>{p}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-2">Buying Triggers</h4>
                      <p className="text-gray-800">{icp.triggers || icp.buyingTriggers || "Trigger events leading to purchasing behavior."}</p>
                    </div>
                    <div>
                      <h4 className="font-bold uppercase tracking-wider text-sm mb-2">Decision Factors</h4>
                      <p className="text-gray-800">{icp.objections || icp.psychology}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. VALUE PROPOSITION TABLE */}
        {outputs.valuePropTables && outputs.valuePropTables.length > 0 && (
          <section className="break-inside-avoid mb-24">
            <div className="border-b-4 border-black pb-4 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-widest">Value Proposition Matrix</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border-2 border-black">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="p-4 font-bold border border-black">ICP</th>
                    <th className="p-4 font-bold border border-black">Desired Outcome</th>
                    <th className="p-4 font-bold border border-black">Current Problem</th>
                    <th className="p-4 font-bold border border-black">Your Method</th>
                    <th className="p-4 font-bold border border-black">What You Replace</th>
                  </tr>
                </thead>
                <tbody>
                  {outputs.valuePropTables.map((row: any, i: number) => (
                    <tr key={i} className="border-b border-black">
                      <td className="p-4 font-bold border border-black">{row.icp}</td>
                      <td className="p-4 border border-black">{row.desiredOutcome}</td>
                      <td className="p-4 border border-black">{row.currentProblem}</td>
                      <td className="p-4 border border-black">{row.method}</td>
                      <td className="p-4 border border-black">{row.replacement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 5. POSITIONING STRATEGY */}
        <section className="break-inside-avoid mb-24">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h2 className="text-4xl font-black uppercase tracking-widest">Positioning Strategy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-50 border border-black">
              <h3 className="font-bold uppercase tracking-wider mb-4">Core Narrative Angle</h3>
              <p className="text-lg italic">"{inputs.narrativeAngles?.join(', ') || 'Value-led differentiation'}"</p>
            </div>
            <div className="p-6 bg-gray-50 border border-black">
              <h3 className="font-bold uppercase tracking-wider mb-4">Global Solution Focus</h3>
              <p className="text-sm leading-relaxed">{outputs.globalSolution}</p>
            </div>
          </div>
        </section>

        {/* 6. WEBSITE STRATEGY */}
        <section className="break-after-page">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h2 className="text-4xl font-black uppercase tracking-widest">Website Strategy</h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown>{outputs.websitePrompt || "Website structure pending generation."}</ReactMarkdown>
          </div>
        </section>

        {/* 7. GTM STRATEGY */}
        {outputs.gtmStrategy && (
          <section className="break-after-page">
            <div className="border-b-4 border-black pb-4 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-widest">Go-To-Market Strategy</h2>
            </div>
            
            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold uppercase mb-6 bg-black text-white inline-block px-4 py-2">Outbound Channels</h3>
                <div className="grid grid-cols-2 gap-6">
                    {outputs.gtmStrategy.leadGen?.outreach?.map((o: any, i: number) => (
                      <div key={i} className="p-6 border border-black space-y-4">
                        <h4 className="font-bold text-xl mb-2 text-primary">{o.icp}</h4>
                        {o.channelTips.map((ct: any, j: number) => (
                          <div key={j} className="space-y-2">
                            <p className="text-[10px] font-bold uppercase text-gray-400">{ct.channel} Tips</p>
                            <ul className="list-disc pl-5 space-y-1">
                              {ct.tips.map((tip: string, k: number) => (
                                <li key={k} className="text-sm leading-relaxed">{tip}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold uppercase mb-6 bg-black text-white inline-block px-4 py-2">Partnerships</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-6 border border-black">
                    <p className="font-bold mb-2">Ideal Partners:</p>
                    <p>{outputs.gtmStrategy.partnerGrowth?.idealPartners?.map((p: any) => p.partners?.join(', ')).join(' | ')}</p>
                    <p className="font-bold mt-4 mb-2">Pitch Logic:</p>
                    <p className="text-sm italic">{outputs.gtmStrategy.partnerGrowth?.outreach?.logic}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 8. STRATEGIC LEAD MAGNETS */}
        {outputs.leadMagnets && outputs.leadMagnets.length > 0 && (
          <section className="break-inside-avoid mb-24">
            <div className="border-b-4 border-black pb-4 mb-10">
              <h2 className="text-4xl font-black uppercase tracking-widest">High-Converting Lead Magnets</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {outputs.leadMagnets.map((lm: any, i: number) => (
                <div key={i} className="p-8 border-2 border-black bg-gray-50 flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="bg-black text-white px-3 py-1 inline-block text-[10px] font-bold uppercase tracking-widest">
                      {lm.icpName || `Target ICP Designation`}
                    </div>
                    <h3 className="text-2xl font-black uppercase leading-tight border-b-2 border-black/10 pb-4">
                      {lm.name}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-widest">Functional Description</p>
                        <p className="text-base leading-relaxed">{lm.description}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-widest">Strategic Lever</p>
                        <p className="text-sm italic leading-relaxed text-gray-700">"{lm.whyIcpWantsIt}"</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 p-4 bg-white border border-black rounded-xl shadow-sm">
                    <p className="text-[10px] font-black uppercase text-black mb-2 flex items-center gap-2">
                       Outreach Integration
                    </p>
                    <p className="text-xs font-medium leading-relaxed text-gray-600 italic">
                      {lm.howItTiesToOutreach}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 9. OUTREACH CAMPAIGNS */}
        {(outputs.outreachCampaign || outputs.dmMessages?.length > 0) && (
          <section className="break-after-page">
            <div className="border-b-4 border-black pb-4 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-widest">Outreach Sequencing</h2>
            </div>

            {outputs.outreachCampaign && (
              <div className="space-y-8 mb-12">
                <h3 className="text-2xl font-bold uppercase bg-black text-white inline-block px-4 py-2">Email & Core Plays</h3>
                <div className="p-6 border border-black">
                  <h4 className="font-bold mb-4 uppercase tracking-wider">Strategy Foundation</h4>
                  <p className="italic">{outputs.outreachCampaign.strategySummary}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 border border-black bg-gray-50">
                    <h4 className="font-bold mb-4 uppercase text-sm">Connection Note</h4>
                    <pre className="whitespace-pre-wrap font-serif text-sm">{outputs.outreachCampaign?.linkedIn?.connectionRequest || "N/A"}</pre>
                  </div>
                  {outputs.outreachCampaign?.linkedIn?.followUps?.map((f: string, i: number) => (
                    <div key={i} className="p-6 border border-black bg-gray-50">
                      <h4 className="font-bold mb-4 uppercase text-sm">Follow-up {i + 1}</h4>
                      <pre className="whitespace-pre-wrap font-serif text-sm">{f || "N/A"}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {outputs.dmMessages && outputs.dmMessages.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold uppercase mb-6 bg-black text-white inline-block px-4 py-2">LinkedIn DMs</h3>
                <div className="space-y-6">
                  {outputs.dmMessages.map((msg: any, i: number) => (
                    <div key={i} className="p-6 border border-black">
                      <h4 className="font-bold uppercase mb-2">{msg.name}</h4>
                      <p className="whitespace-pre-wrap mb-4 font-medium">"{msg.message}"</p>
                      <p className="text-xs text-gray-500"><strong>Psychology:</strong> {msg.whyItWorks}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* 10. PROFILE OPTIMIZATION */}
        <section className="break-inside-avoid mb-24">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h2 className="text-4xl font-black uppercase tracking-widest">Profile Optimization</h2>
          </div>
          <div className="space-y-8">
            <div className="p-8 bg-gray-50 border border-black">
              <h3 className="font-bold uppercase tracking-wider mb-6 text-xl">Headlines</h3>
              <ul className="space-y-4">
                {outputs.optimizedHeadlines?.map((hl: string, i: number) => (
                  <li key={i} className="text-lg font-medium pl-4 border-l-4 border-black">{hl}</li>
                ))}
              </ul>
            </div>
            <div className="p-8 border border-black">
              <h3 className="font-bold uppercase tracking-wider mb-6 text-xl">The About Section</h3>
              <div className="prose prose-lg max-w-none font-serif leading-relaxed whitespace-pre-wrap">
                {outputs.optimizedAbout || "No about section generated."}
              </div>
            </div>
          </div>
        </section>

        {/* 11. ACTION PLAN */}
        <section className="break-inside-avoid">
          <div className="border-b-4 border-black pb-4 mb-8">
            <h2 className="text-4xl font-black uppercase tracking-widest">Execution Action Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-black pb-12">
              <h3 className="text-3xl font-black mb-4 uppercase text-gray-300">Phase 1</h3>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-black pb-2">Foundation</h4>
              <ul className="list-disc pl-5 space-y-3 text-sm font-medium">
                <li>Update LinkedIn Profile with generated Headline & About text.</li>
                <li>Finalize Value Proposition targeting the primary ICP.</li>
                <li>Implement Website Strategy layout and copy.</li>
              </ul>
            </div>
            <div className="p-6 border border-black pb-12">
              <h3 className="text-3xl font-black mb-4 uppercase text-gray-300">Phase 2</h3>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-black pb-2">Campaign Setup</h4>
              <ul className="list-disc pl-5 space-y-3 text-sm font-medium">
                <li>Choose 1 core Lead Magnet to build & publish.</li>
                <li>Configure Outreach sequence (Connection + 3 Follow-ups).</li>
                <li>Identify and map target list in Sales Navigator/Apollo.</li>
              </ul>
            </div>
            <div className="p-6 border border-black pb-12 bg-black text-white">
              <h3 className="text-3xl font-black mb-4 uppercase text-gray-700">Phase 3</h3>
              <h4 className="font-bold uppercase tracking-wider mb-4 border-b border-white pb-2">Scale & Iterate</h4>
              <ul className="list-disc pl-5 space-y-3 text-sm font-medium">
                <li>Launch Day 1 Outbound volume.</li>
                <li>Track connection acceptance rates against benchmarks.</li>
                <li>A/B test the secondary narrative angle over 14 days.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background: white; }
          .break-after-page { page-break-after: always; }
          .break-inside-avoid { page-break-inside: avoid; }
          @page { margin: 0.5in; size: A4; }
        }
      `}} />
    </div>
  );
};

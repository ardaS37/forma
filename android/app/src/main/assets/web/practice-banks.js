(() => {
  globalThis.PracticeBanks={limits:LimitBank,derivatives:DerivativeBank,integrals:IntegralBank};
  globalThis.PracticeLabels={limits:'Limit',derivatives:'Türev',integrals:'İntegral'};
  // MEB general secondary mathematics, 20.01.2018, outcomes 12.5 and 12.6.
  // Keep specialty 0/0 identities, infinite limits and non-power derivatives below
  // the divider; continuous elementary limit evaluations remain above it.
  const highSchool={
    limits:['direct','polynomial','rational','factorization','radical','trig','exponential','logarithm','onesided','absolute','piecewise','continuity'],
    derivatives:['graphs','polynomial','roots','negative','product','quotient','chain','second','point','tangent','definition','piecewise','extrema','rates'],
    integrals:['graphs','power','roots','reciprocal','substitution','definite','area','fundamental','initial']
  };
  for(const [mode,bank] of Object.entries(PracticeBanks)){
    for(const topic of bank.topics)topic.level=highSchool[mode].includes(topic.id)?'high-school':'university';
    bank.topicGroups=['high-school','university'].map(level=>({level,topics:bank.topics.filter(topic=>topic.level===level)}));
  }
})();

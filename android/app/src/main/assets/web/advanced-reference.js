/* One additional reference per main topic, including validity conditions. */
(() => {
const rows=[
['linear-algebra','la-matrices','Simetrik ayrışım','Symmetric decomposition','A=(A+Aᵀ)/2+(A−Aᵀ)/2','Gerçek kare matris; ayrışım tektir.','Real square matrix; decomposition is unique.'],
['linear-algebra','la-determinants','Birinci dereceden güncelleme','Rank-one update','det(I+uvᵀ)=1+vᵀu','u ve v aynı boyutta sütun vektörleri.','u and v are column vectors of equal dimension.'],
['linear-algebra','la-systems','Rank ile tutarlılık','Consistency by rank','rank A=rank [A|b]','Ax=b ancak ve ancak bu eşitlikte tutarlıdır.','Ax=b is consistent if and only if this equality holds.'],
['linear-algebra','la-vectors','Cauchy–Schwarz','Cauchy–Schwarz','|u·v|≤||u|| ||v||','Gerçek iç çarpım; eşitlik doğrusal bağımlılıkta.','Real inner product; equality for linear dependence.'],
['linear-algebra','la-spaces','Alt uzayların boyut formülü','Dimension formula','dim(U+W)=dim U+dim W−dim(U∩W)','Sonlu boyutlu alt uzaylar.','Finite-dimensional subspaces.'],
['linear-algebra','la-maps','Baz değişimi','Change of basis','B=P⁻¹AP','P yeni baz sütunlarını taşır ve terslenebilirdir.','P contains new basis columns and is invertible.'],
['linear-algebra','la-eigen','Jordan bloğunun kuvveti','Power of a Jordan block','(λI+N)^n=λ^n I+nλ^(n−1)N','N²=0; n pozitif tamsayı.','N²=0; n a positive integer.'],
['linear-algebra','la-projections','En küçük kareler koşulu','Least-squares condition','Aᵀ(Ax−b)=0','Tam sütun rankı tek minimizer sağlar.','Full column rank guarantees a unique minimizer.'],
['discrete-math','dm-logic','Niceleyici olumsuzlama','Quantifier negation','¬∀x∃y P=∃x∀y ¬P','Niceleyici sırası korunur, her niceleyici türü değişir.','Preserve order and reverse each quantifier type.'],
['discrete-math','dm-sets','Üç kümede dahil etme–çıkarma','Three-set inclusion–exclusion','|A∪B∪C|=|A|+|B|+|C|−|A∩B|−|A∩C|−|B∩C|+|A∩B∩C|','Sonlu kümeler; ikili kesişimler üçlüyü içerir.','Finite sets; pair intersections include the triple.'],
['discrete-math','dm-counting','Dairesel permütasyon','Circular permutation','N=(n−1)!','n farklı nesne, yalnız döndürmeler eşdeğer.','n distinct objects; only rotations identified.'],
['discrete-math','dm-relations','Denklik sınıfları','Equivalence classes','xRy ⇔ x≡y (mod m)','m pozitif tamsayı; sınıflar ayrık bir bölüntü oluşturur.','Positive integer m; classes form a disjoint partition.'],
['discrete-math','dm-functions','Örten fonksiyon sayısı','Surjection count','N=Σⱼ₌₀ᵐ(−1)^j C(m,j)(m−j)^n','n kaynak, m hedef; iki küme sonlu.','Finite sets with n source and m target elements.'],
['discrete-math','dm-arithmetic','Kongrüansın çözüm koşulu','Congruence solvability','ax≡b (mod m); d=gcd(a,m)','Çözüm için d, b’yi bölmeli; varsa mod m’de d çözüm.','A solution exists iff d divides b; then d residues solve it modulo m.'],
['discrete-math','dm-graphs','Euler yolu koşulu','Euler trail criterion','odd degree count=0 or 2','Kenar taşıyan kısmı bağlı yönsüz çizge.','Undirected graph whose nonisolated part is connected.'],
['discrete-math','dm-trees','Tam ikili ağaç','Full binary tree','I=L−1; V=2L−1','Her iç düğümün tam iki çocuğu vardır.','Every internal node has exactly two children.'],
['discrete-math','dm-recurrences','Afin yineleme','Affine recurrence','aₙ=r^n a₀+b(r^n−1)/(r−1)','aₙ₊₁=raₙ+b; r≠1.','aₙ₊₁=raₙ+b; r≠1.'],
['differential-equations','ode-basics','Yerel kararlılık','Local stability','y′=f(y); f(y*)=0','f′(y*)<0 kararlı, >0 kararsız; sıfır türev kararsızlık kararı vermez.','Negative derivative gives stability, positive instability; zero derivative is inconclusive.'],
['differential-equations','ode-separable','Sonlu zamanda patlama','Finite-time blow-up','y=b/(1−abx)','y′=ay², y(0)=b; a,b>0; maksimal aralık x<1/(ab).','y′=ay², y(0)=b; a,b>0; maximal interval x<1/(ab).'],
['differential-equations','ode-linear','İntegrasyon çarpanı','Integrating factor','μ=exp(∫p(x)dx); (μy)′=μq','y′+py=q; katsayılar seçilen aralıkta sürekli.','y′+py=q; coefficients continuous on the chosen interval.'],
['differential-equations','ode-exact','Tam diferansiyel koşulu','Exact differential criterion','Mᵧ=Nₓ; Fₓ=M, Fᵧ=N','Sürekli kısmi türevler ve basit bağlantılı açık bölge.','Continuous partial derivatives on a simply connected open domain.'],
['differential-equations','ode-nonlinear','Bernoulli dönüşümü','Bernoulli substitution','z=y^(1−n)','y′+py=qy^n; n≠0,1; sıfır çözümü ayrıca denetlenir.','y′+py=qy^n; n≠0,1; check the zero solution separately.'],
['differential-equations','ode-second','Mertebe düşürme','Reduction of order','y₂=y₁∫exp(−∫p dx)/y₁² dx','y″+py′+qy=0; y₁ seçilen aralıkta sıfır olmayan çözüm.','y″+py′+qy=0; known solution y₁ is nonzero on the interval.'],
['differential-equations','ode-particular','Rezonans yanıtı','Resonant response','y=bx sin(ωx)/(2ω)','y″+ω²y=b cos(ωx), sıfır başlangıç; ω>0.','y″+ω²y=b cos(ωx), zero initial data; ω>0.'],
['differential-equations','ode-laplace','İkinci kaydırma teoremi','Second shifting theorem','L{H(t−c)f(t−c)}=e^(−cs)F(s)','c≥0; dönüşümün varlık koşulları sağlanmalı.','c≥0; usual transform existence assumptions hold.'],
['differential-equations','ode-systems','Euler mutlak kararlılığı','Euler absolute stability','|1+hλ|<1','y′=λy; λ<0 gerçek ise 0<h<−2/λ.','For real λ<0 in y′=λy, 0<h<−2/λ.']
];
for(const[program,topic,tr,en,eq,note,enNote]of rows){UniversityQuestions.bankFor(program).catalog.find(row=>row.id===topic).formulas.push([tr,eq,note]);translations[tr]=en;translations[note]=enNote;}
Object.assign(translations,{'odd degree count=0 or 2':'odd degree count=0 or 2'});
})();

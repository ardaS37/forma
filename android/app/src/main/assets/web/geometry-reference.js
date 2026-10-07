/* Reference formulas for the expanded families; notes carry required conditions. */
(() => {
const rows={geometry:[
 ['g-angles','Açıortayların dikliği','Perpendicular bisectors of adjacent angles','α+β=180° ⇒ α/2+β/2=90°','Komşu bütünler açıların iç açıortayları.','Internal bisectors of adjacent supplementary angles.'],
 ['g-triangles','Heron bağıntısı','Heron formula','s=(a+b+c)/2; A=√[s(s−a)(s−b)(s−c)]','Pozitif kenarlar üçgen eşitsizliğini sağlamalıdır.','Positive sides must satisfy the triangle inequalities.'],
 ['g-triangles','İç ve çevrel yarıçap','Inradius and circumradius','r=A/s; R=abc/(4A)','A>0; s yarı çevredir.','A>0; s is the semiperimeter.'],
 ['g-quadrilaterals','Paralelkenar köşegen toplamı','Parallelogram diagonal identity','d₁²+d₂²=2(a²+b²)','a,b komşu kenarlar; genel paralelkenarda geçerlidir.','a,b are adjacent sides; valid for every parallelogram.'],
 ['g-polygons','Apotem ile düzgün çokgen alanı','Regular polygon area from apothem','A=P·r/2','P çevre, r apotem; çokgen düzgün ve dışbükeydir.','P is perimeter and r apothem; polygon is regular and convex.'],
 ['g-circles','Noktanın çembere göre kuvveti','Power of a point','PT²=PA·PB; EA·EB=EC·ED','İlk bağıntıda P dışarıda, T teğet noktası; ikincide E kirişlerin iç kesişimidir.','P is external and T a tangent point in the first identity; E is an interior chord intersection in the second.'],
 ['g-similarity','Benzerlikte boyutsal ölçek','Dimensional scaling under similarity','L₂/L₁=k; A₂/A₁=k²','k>0 uzunluk oranı; karşılık gelen büyüklükler karşılaştırılır.','k>0 is the length ratio; compare corresponding quantities.']
 ],'solid-geometry':[
 ['s-cube','Yüzey açılımında küp yolu','Cube path in an unfolding','d_yüzey=a√5; d_uzay=a√3','Karşı cisim köşeleri arasında; yüzey ve uzay yolları ayrı kısıtlardır.','Between opposite vertices; surface and spatial paths have different constraints.'],
 ['s-box','Dik prizma yüzeyinde en kısa yol','Shortest rectangular-box surface path','d=min{√[(a+b)²+h²],√[(a+h)²+b²],√[(b+h)²+a²]}','Karşı köşeler arasında, a,b,h>0.','Between opposite vertices, a,b,h>0.'],
 ['s-prisms','Eğik prizma hacmi','Oblique prism volume','V=B·h','h dik yüksekliktir; eğik yan ayrıt değildir.','h is perpendicular height, not the slant edge.'],
 ['s-pyramids','Kesik piramit hacmi','Pyramid frustum volume','V=h(B₁+√(B₁B₂)+B₂)/3','Paralel ve benzer tabanlar; h dik yükseklik.','Parallel similar bases; h is perpendicular height.'],
 ['s-cylinders','İçi boş silindir hacmi','Hollow cylinder volume','V=π(R²−r²)h','R>r>0; iç sınır yanal alanı toplam yüzey alanına eklenir.','R>r>0; inner lateral boundary is added to total surface area.'],
 ['s-cones','Kesik koni hacim ve yanal alanı','Cone frustum volume and lateral area','V=πh(R²+Rr+r²)/3; S_yanal=π(R+r)ℓ','ℓ=√[h²+(R−r)²]; dik kesik koni.','ℓ=√[h²+(R−r)²]; a right cone frustum.'],
 ['s-spheres','Küre kapağı bağıntıları','Spherical cap identities','ρ²=2Rh−h²; V=πh²(R−h/3); S_eğri=2πRh','0<h<2R; eğri alan taban diskini içermez.','0<h<2R; curved area excludes the base disk.'],
 ['s-spheres','Peçete halkası hacmi','Napkin ring volume','V=πH³/6','Merkezî silindirik delik; H kalan halkanın toplam yüksekliğidir.','A central cylindrical bore; H is the remaining ring height.']
 ],'analytic-geometry':[
 ['ag-coordinates','Dıştan bölme noktası','External division point','AP/PB=m/n ⇒ P=(mB−nA)/(m−n)','m,n>0 ve m≠n; A≠B.','m,n>0 and m≠n; A≠B.'],
 ['ag-lines','Dik izdüşüm ve yansıma','Projection and reflection','H=P−t(a,b); P′=P−2t(a,b); t=(aP_x+bP_y+c)/(a²+b²)','ax+by+c=0; (a,b) sıfır vektör değildir.','ax+by+c=0; (a,b) is nonzero.'],
 ['ag-circles','Çember-doğru kesişim koşulu','Circle-line intersection condition','d<r: iki; d=r: bir; d>r: sıfır','d merkez-doğru dik uzaklığı, r>0.','d is perpendicular center-to-line distance, r>0.'],
 ['ag-parabolas','Ötelenmiş parabolün odak tanımı','Focus of a translated parabola','(y−k)²=4p(x−h); F=(h+p,k); doğrultman x=h−p','p≠0; fiziksel odak uzaklığı |p|.','p≠0; physical focal distance is |p|.'],
 ['ag-ellipses','Elipse teğet denklemi','Ellipse tangent equation','x₀x/a²+y₀y/b²=1','P=(x₀,y₀), x²/a²+y²/b²=1 üzerinde; a,b>0.','P=(x₀,y₀) lies on x²/a²+y²/b²=1; a,b>0.'],
 ['ag-hyperbolas','Hiperbole teğet denklemi','Hyperbola tangent equation','x₀x/a²−y₀y/b²=1','P hiperbol üzerinde; köşelerde teğet düşey olabilir.','P lies on the hyperbola; vertex tangents may be vertical.'],
 ['ag-transformations','Merkezli dönme','Rotation about a center','P′=O+R(P−O); R₉₀(u,v)=(−v,u)','90° saat yönünün tersi dönüş; önce merkeze öteleme yapılır.','A counterclockwise 90° rotation; translate to the center first.'],
 ['ag-space','Aykırı doğruların uzaklığı','Distance between skew lines','d=|(Q−P)·(u×v)|/|u×v|','u×v≠0; paralel doğrular için farklı bağıntı gerekir.','u×v≠0; parallel lines require a different formula.']
 ]};
for(const[program,list]of Object.entries(rows))for(const[topic,tr,en,eq,note,enNote]of list){UniversityQuestions.bankFor(program).catalog.find(t=>t.id===topic).formulas.push([tr,eq,note]);translations[tr]=en;translations[note]=enNote;}
Object.assign(translations,{
 'd<r: iki; d=r: bir; d>r: sıfır':'d<r: two; d=r: one; d>r: zero',
 '(y−k)²=4p(x−h); F=(h+p,k); doğrultman x=h−p':'(y−k)²=4p(x−h); F=(h+p,k); directrix x=h−p',
 'd_yüzey=a√5; d_uzay=a√3':'d_surface=a√5; d_space=a√3',
 'V=πh(R²+Rr+r²)/3; S_yanal=π(R+r)ℓ':'V=πh(R²+Rr+r²)/3; S_lateral=π(R+r)ℓ',
 'ρ²=2Rh−h²; V=πh²(R−h/3); S_eğri=2πRh':'ρ²=2Rh−h²; V=πh²(R−h/3); S_curved=2πRh'
});
})();

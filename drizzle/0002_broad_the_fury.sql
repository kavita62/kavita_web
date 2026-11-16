ALTER TABLE `homepageSettings` ADD `aboutImage` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutEyebrow` varchar(160) NOT NULL DEFAULT 'SOBRE / GERSON GEREMIAS UCHILA';
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutStamp` varchar(160) NOT NULL DEFAULT 'TAMBÉM KAVITA UCHILA';
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutHeadline` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutBody` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutSmall` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutSignature` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutPortfolio` text NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutFooterLeft` varchar(160) NOT NULL DEFAULT 'PESSOAS / LUZ / RITMO';
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutFooterHeadline` varchar(255) NOT NULL DEFAULT 'FAZEMOS O FRAME MOVER-SE.';
--> statement-breakpoint
ALTER TABLE `homepageSettings` ADD `aboutFooterRight` varchar(160) NOT NULL DEFAULT 'LUANDA / MUNDO';
--> statement-breakpoint
ALTER TABLE `projects` ADD `coverImage` text;
--> statement-breakpoint
UPDATE `homepageSettings` SET
  `aboutImage` = '',
  `aboutEyebrow` = 'SOBRE / GERSON GEREMIAS UCHILA',
  `aboutStamp` = 'TAMBÉM KAVITA UCHILA',
  `aboutHeadline` = 'Duas forças movem cada frame: uma ideia visual com impacto e código que a faz funcionar.',
  `aboutBody` = 'A paixão por videojogos, cinema, modelação 3D e criação de conceitos levou Gerson Geremias Uchila a construir universos visuais para marcas, música, cultura e pessoas. Hoje trabalha de forma independente, com a pequena equipa Planilha, juntando direcção visual, motion, 3D, design e novas ferramentas de inteligência artificial.',
  `aboutSmall` = 'Diretor visual independente · artista 3D · tecnólogo criativo',
  `aboutSignature` = 'Gerson Geremias Uchila\\nDiretor visual · artista 3D · tecnólogo criativo',
  `aboutPortfolio` = '[{"label":"DESIGN GRÁFICO","items":"Universo Digital TV · Optims · Chimuma · Kolapo Arquitectura · Convénios Solution · Fab Pro · Moldar · FTE · Koolba"},{"label":"AUDIOVISUAL / MOTION","items":"FTE Video Promo · Kanuca · Missão Angola · Ginástica Na Minha Banda"},{"label":"ARTE 3D","items":"Design de interiores · Kolapo · Trabalhos pessoais · ZBrush"},{"label":"STARTUPS","items":"Vab · Skikies · Farmy dos Criadores"},{"label":"GALERIAS / EVENTOS","items":"Expo Recicla · FTE · Morna"}]',
  `aboutFooterLeft` = 'PESSOAS / LUZ / RITMO',
  `aboutFooterHeadline` = 'FAZEMOS O FRAME MOVER-SE.',
  `aboutFooterRight` = 'LUANDA / MUNDO',
  `slideKicker` = 'OS NOSSOS CRIADORES',
  `slideItems` = '["KAVITA UCHILA","GERSÓN GEREMIAS","IMAGEM COM PULSO","FREQUÊNCIA NEGRA","ESTUDOS DE MOVIMENTO","CULTURA DA LUZ","SINAL NOTURNO","FORMA HUMANA","LUANDA / MUNDO","UNIDADE EDITORIAL","DO SOM À IMAGEM","HISTÓRIAS VISUAIS"]'
WHERE `id` = 1;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `aboutImage` text NOT NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `aboutHeadline` text NOT NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `aboutBody` text NOT NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `aboutSmall` text NOT NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `aboutSignature` text NOT NULL;
--> statement-breakpoint
ALTER TABLE `homepageSettings` MODIFY `aboutPortfolio` text NOT NULL;
--> statement-breakpoint
UPDATE `projects` SET `label`='MÚSICA', `title`='Mãos no som', `tag`='ESTÚDIO / RITMO', `description`='Um estudo táctil de mãos, ritmo e da electricidade silenciosa de uma sala antes da primeira nota.', `role`='DIRECÇÃO VISUAL / IMAGEM EM MOVIMENTO', `location`='LUANDA / MUNDO' WHERE `id`='piano-40390';
--> statement-breakpoint
UPDATE `projects` SET `label`='RETRATO', `title`='Novas silhuetas', `tag`='MODA / FORMA', `description`='Retratos que se movem como tecido: directos, íntimos e construídos no instante em que uma silhueta se torna presença.', `role`='CAMPANHA / DIRECÇÃO DE ARTE', `location`='LUANDA / MUNDO' WHERE `id`='portrait-316579';
--> statement-breakpoint
UPDATE `projects` SET `label`='MOVIMENTO', `title`='Corpos no frame', `tag`='PERFORMANCE / ENERGIA', `description`='Corpos em movimento, cortados pelo beat. Um fragmento sobre energia, libertação e a forma de um gesto.', `role`='PERFORMANCE / EDITORIAL', `location`='LUANDA / MUNDO' WHERE `id`='dance-75547';
--> statement-breakpoint
UPDATE `projects` SET `label`='EDITORIAL', `title`='A luz encontra a pele', `tag`='CAMPANHA / TEXTURA', `description`='Um estudo sobre a luz a encontrar a pele, a textura e a geometria imperfeita de um frame em movimento.', `role`='CRIAÇÃO DE IMAGEM / DIRECÇÃO', `location`='LUANDA / MUNDO' WHERE `id`='fashion-362758';
--> statement-breakpoint
UPDATE `projects` SET `label`='SOM', `title`='Depois do beat', `tag`='MÚSICA / ATITUDE', `description`='Depois do beat, a imagem continua a mover-se. O som torna-se postura, cor e uma sala cheia de sinal.', `role`='MÚSICA / SISTEMA VISUAL', `location`='LUANDA / MUNDO' WHERE `id`='dj-13071';
--> statement-breakpoint
UPDATE `projects` SET `label`='PESSOAS', `title`='O grande plano', `tag`='RETRATO / PRESENÇA', `description`='Um grande plano nunca está parado. Um retrato de atenção, proximidade e dos detalhes que ficam connosco.', `role`='RETRATO / IMAGEM EM MOVIMENTO', `location`='LUANDA / MUNDO' WHERE `id`='studio-33517';

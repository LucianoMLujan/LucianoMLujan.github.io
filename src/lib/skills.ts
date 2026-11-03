export interface Skill {
	name: string;
	color: string;
	icon: string;
}

/**
 * Habilidades técnicas del CV. Alimentan los textos que orbitan en la
 * escena 3D del hero y flotan en el fondo.
 */
export const skills: Skill[] = [
	{ name: "HTML5", color: "#e34f26", icon: "simple-icons:html5" },
	{ name: "CSS3", color: "#264de4", icon: "simple-icons:css3" },
	{ name: "JavaScript", color: "#f7df1e", icon: "simple-icons:javascript" },
	{ name: "TypeScript", color: "#3178c6", icon: "simple-icons:typescript" },
	{ name: "PHP", color: "#777bb4", icon: "simple-icons:php" },
	{ name: "Laravel", color: "#ff2d20", icon: "simple-icons:laravel" },
	{ name: "Vue.js", color: "#42b883", icon: "simple-icons:vuedotjs" },
	{ name: "Angular", color: "#dd0031", icon: "simple-icons:angular" },
	{ name: "Node.js", color: "#339933", icon: "simple-icons:nodedotjs" },
	{ name: "jQuery", color: "#0769ad", icon: "simple-icons:jquery" },
	{ name: "MySQL", color: "#4479a1", icon: "simple-icons:mysql" },
	{ name: "MongoDB", color: "#47a248", icon: "simple-icons:mongodb" },
	{ name: "C#", color: "#68217a", icon: "simple-icons:csharp" },
	{ name: ".NET", color: "#512bd4", icon: "simple-icons:dotnet" },
	{ name: "MS SQL", color: "#cc2927", icon: "simple-icons:microsoftsqlserver" },
	{ name: "Docker", color: "#2496ed", icon: "simple-icons:docker" },
	{ name: "AWS", color: "#ff9900", icon: "simple-icons:amazonaws" },
];

import { storyblokEditable } from '@storyblok/react/rsc';

const Teaser = ({ blok }) => {
	return (
		<div className="teaser" {...storyblokEditable(blok)}>
			<h1>{blok.headline}</h1>
			<p>{blok.teaser_subtitle}</p>
		</div>
	);
};

export default Teaser;

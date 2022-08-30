
export const setSlug = (slug: string, title: string) => {
    if (!slug) {
        slug = title;
    }
    
    slug = slug.toLowerCase().replaceAll(' ', '_').replaceAll("'", '');
    return slug;
}
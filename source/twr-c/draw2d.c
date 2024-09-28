#include <stdlib.h>
#include <assert.h>
#include <string.h>
#include "twr-crt.h"
#include "twr-draw2d.h"
#include <math.h> // ceil


static twr_ioconsole_t *__std2d;

void twr_set_std2d_con(twr_ioconsole_t *setto) {
	__std2d=setto; 
}

twr_ioconsole_t * twr_get_std2d_con() {
	return __std2d;
}

void d2d_free_instructions(struct d2d_draw_seq* ds) {
    assert(ds);
    if (ds) {
        struct d2d_instruction_hdr *next=ds->start;

        while (next) {
            //twr_conlog("free instruction me %x type %x next %x",next, next->type, next->next);
            struct d2d_instruction_hdr * nextnext=next->next;
            if (next->heap_ptr != NULL) {
               twr_cache_free(next->heap_ptr);
            }
            if (next->heap_ptr2 != NULL) {
               twr_cache_free(next->heap_ptr2);
            }
            twr_cache_free(next);
            next=nextnext;
        }
        ds->start=0;
        ds->last=0;
    }
}

char* cache_strdup(const char* str) {
   size_t len = strlen(str) + 1; //include null terminator
   char* ret = (char*)twr_cache_malloc(len);
   
   memcpy(ret, str, len);

   return ret;
}

static void invalidate_cache(struct d2d_draw_seq* ds) {
    ds->last_fillstyle_color_valid=false;
    ds->last_strokestyle_color_valid=false;
    ds->last_line_width=-1;  // invalid value 
}

struct d2d_draw_seq* d2d_start_draw_sequence_with_con(int flush_at_ins_count, twr_ioconsole_t * con) {
    //twr_conlog("C: d2d_start_draw_sequence");
    struct d2d_draw_seq* ds = twr_cache_malloc(sizeof(struct d2d_draw_seq));
    assert(ds);
    ds->last=0;
    ds->start=0;
    ds->ins_count=0;
    invalidate_cache(ds);
    ds->flush_at_ins_count=flush_at_ins_count;
    ds->con=con;
    return ds;
}

struct d2d_draw_seq* d2d_start_draw_sequence(int flush_at_ins_count) {
    return d2d_start_draw_sequence_with_con(flush_at_ins_count, twr_get_std2d_con());
}

void d2d_end_draw_sequence(struct d2d_draw_seq* ds) {
    //twr_conlog("C: end_draw_seq");
    d2d_flush(ds);
    if (ds) {  // should never happen -- ie, ds==NULL
        twr_cache_free(ds);
    }
    // printf("available: %ld\n", avail());
}

void d2d_flush(struct d2d_draw_seq* ds) {
    assert(ds);
    if (ds) {
        if (ds->start) {
            //twr_conlog("do d2d_flush");
            // really i should add an "draw2d" driver to IoConsole, add it to jscon,  and call into that, which would call twrConDrawSeq
            twrConDrawSeq(__twr_get_jsid(ds->con), ds);
            d2d_free_instructions(ds); 
            ds->ins_count=0;
        }
    }
}

void new_instruction(struct d2d_draw_seq* ds) {
    //twr_conlog("new_instruction %d %d", ds->ins_count, ds->flush_at_ins_count);

    assert(ds);
    ds->ins_count++;
    if (ds->ins_count >= ds->flush_at_ins_count)  {  // if "too big" flush the draw sequence
        d2d_flush(ds);
        //twr_conlog("D2D automatic flush() called.  Queued instructions exceeded %d", ds->flush_at_ins_count);

    }
}

static void set_ptrs(struct d2d_draw_seq* ds, struct d2d_instruction_hdr *e, void* heap_ptr, void* heap_ptr2) {
    assert(ds);
    if (ds->start==0) {
        ds->start=e;
        //twr_conlog("C: set_ptrs start set to %x",ds->start);
    }
    e->next=0;
    if (ds->last)
        ds->last->next=e;
    ds->last=e;
    e->heap_ptr = heap_ptr;
    e->heap_ptr2 = heap_ptr2;
    new_instruction(ds);
    //twr_conlog("C: set_ptrs ds->last set to %x",ds->last);
}

int d2d_get_canvas_prop(const char* prop_name) {
	return io_get_prop(twr_get_std2d_con(), prop_name);
}

void d2d_fillrect(struct d2d_draw_seq* ds, double x, double y, double w, double h) {
    struct d2dins_fillrect* r= twr_cache_malloc(sizeof(struct d2dins_fillrect));
    r->hdr.type=D2D_FILLRECT;
    r->x=x;
    r->y=y;
    r->w=w;
    r->h=h;
    set_ptrs(ds, &r->hdr, NULL, NULL);
    //twr_conlog("C: fillrect,last_fillstyle_color:  %d",ds->last_fillstyle_color);
}

void d2d_strokerect(struct d2d_draw_seq* ds, double x, double y, double w, double h) {
    struct d2dins_strokerect* r= twr_cache_malloc(sizeof(struct d2dins_strokerect));
    r->hdr.type=D2D_STROKERECT;
    r->x=x;
    r->y=y;
    r->w=w;
    r->h=h;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_setlinewidth(struct d2d_draw_seq* ds, double width) {
    if (ds->last_line_width!=width) {
        ds->last_line_width=width;
        struct d2dins_setlinewidth* e= twr_cache_malloc(sizeof(struct d2dins_setlinewidth));
        e->hdr.type=D2D_SETLINEWIDTH;
        e->width=width;
        set_ptrs(ds, &e->hdr, NULL, NULL);  
    }
}

// NOTE color is unsigned long RGBA (don't forget the alpha)
void d2d_setfillstylergba(struct d2d_draw_seq* ds, unsigned long color) {
    //twr_conlog("C: d2d_setfillstyle %d %d %d",color, ds->last_fillstyle_color, color!=ds->last_fillstyle_color);

    if (!(ds->last_fillstyle_color_valid && color==ds->last_fillstyle_color)) {
        ds->last_fillstyle_color=color;
        ds->last_fillstyle_color_valid=true;
        struct d2dins_setfillstylergba* e= twr_cache_malloc(sizeof(struct d2dins_setfillstylergba));
        e->hdr.type=D2D_SETFILLSTYLERGBA;
        e->color=color;
        set_ptrs(ds, &e->hdr, NULL, NULL);  
    }
}

// NOTE color is unsigned long RGBA (don't forget the alpha)
void d2d_setstrokestylergba(struct d2d_draw_seq* ds, unsigned long color) {
    //twr_conlog("C: d2d_setstrokestylergba %d %d %d",color, ds->last_fillstyle_color, color!=ds->last_fillstyle_color);

    if (!(ds->last_strokestyle_color_valid && color==ds->last_strokestyle_color)) {
        ds->last_strokestyle_color=color;
        ds->last_strokestyle_color_valid=true;
        struct d2dins_setstrokestylergba* e= twr_cache_malloc(sizeof(struct d2dins_setstrokestylergba));
        e->hdr.type=D2D_SETSTROKESTYLERGBA;
        e->color=color;
        set_ptrs(ds, &e->hdr, NULL, NULL);  
    }
}

void d2d_setfillstyle(struct d2d_draw_seq* ds, const char* css_color) {
    struct d2dins_setfillstyle* e= twr_cache_malloc(sizeof(struct d2dins_setfillstyle));
    e->hdr.type=D2D_SETFILLSTYLE;
    e->css_color=cache_strdup(css_color);
    set_ptrs(ds, &e->hdr, (void*)e->css_color, NULL); 
}

void d2d_setstrokestyle(struct d2d_draw_seq* ds, const char* css_color) {
    struct d2dins_setstrokestyle* e= twr_cache_malloc(sizeof(struct d2dins_setstrokestyle));
    e->hdr.type=D2D_SETSTROKESTYLE;
    e->css_color=cache_strdup(css_color);
    set_ptrs(ds, &e->hdr, (void*)e->css_color, NULL); 
}

void d2d_setfont(struct d2d_draw_seq* ds, const char* font) {
    struct d2dins_setfont* e= twr_cache_malloc(sizeof(struct d2dins_setfont));
    e->hdr.type=D2D_SETFONT;
    e->font=cache_strdup(font);
    set_ptrs(ds, &e->hdr, (void*)e->font, NULL); 
}

void d2d_beginpath(struct d2d_draw_seq* ds) {
    struct d2dins_beginpath* e= twr_cache_malloc(sizeof(struct d2dins_beginpath));
    e->hdr.type=D2D_BEGINPATH;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_fill(struct d2d_draw_seq* ds) {
    struct d2dins_fill* e= twr_cache_malloc(sizeof(struct d2dins_fill));
    e->hdr.type=D2D_FILL;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_stroke(struct d2d_draw_seq* ds) {
    struct d2dins_stroke* e= twr_cache_malloc(sizeof(struct d2dins_stroke));
    e->hdr.type=D2D_STROKE;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_save(struct d2d_draw_seq* ds) {
    struct d2dins_save* e= twr_cache_malloc(sizeof(struct d2dins_save));
    e->hdr.type=D2D_SAVE;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_restore(struct d2d_draw_seq* ds) {
    struct d2dins_restore* e= twr_cache_malloc(sizeof(struct d2dins_restore));
    invalidate_cache(ds);
    e->hdr.type=D2D_RESTORE;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_moveto(struct d2d_draw_seq* ds, double x, double y) {
    struct d2dins_moveto* e= twr_cache_malloc(sizeof(struct d2dins_moveto));
    e->hdr.type=D2D_MOVETO;
    e->x=x;
    e->y=y;
    set_ptrs(ds, &e->hdr, NULL, NULL);  
}

void d2d_lineto(struct d2d_draw_seq* ds, double x, double y) {
    struct d2dins_lineto* e= twr_cache_malloc(sizeof(struct d2dins_lineto));
    e->hdr.type=D2D_LINETO;
    e->x=x;
    e->y=y;
    set_ptrs(ds, &e->hdr, NULL, NULL);  
}

void d2d_arc(struct d2d_draw_seq* ds, double x, double y, double radius, double start_angle, double end_angle, bool counterclockwise) {
    struct d2dins_arc* e= twr_cache_malloc(sizeof(struct d2dins_arc));
    e->hdr.type=D2D_ARC;
    e->x=x;
    e->y=y;
    e->radius=radius;
    e->start_angle=start_angle;
    e->end_angle=end_angle;
    e->counterclockwise=counterclockwise;
    set_ptrs(ds, &e->hdr, NULL, NULL);  
}

void d2d_bezierto(struct d2d_draw_seq* ds, double cp1x, double cp1y, double cp2x, double cp2y, double x, double y) {
    struct d2dins_bezierto* e= twr_cache_malloc(sizeof(struct d2dins_bezierto));
    e->hdr.type=D2D_BEZIERTO;
    e->cp1x=cp1x;
    e->cp1y=cp1y;
    e->cp2x=cp2x;
    e->cp2y=cp2y;
    e->x=x;
    e->y=y;
    set_ptrs(ds, &e->hdr, NULL, NULL);  
}


void d2d_filltext(struct d2d_draw_seq* ds, const char* str, double x, double y) {
    struct d2dins_filltext* e= twr_cache_malloc(sizeof(struct d2dins_filltext));
    e->hdr.type=D2D_FILLTEXT;
    e->x=x;
    e->y=y;
    e->str=cache_strdup(str);
	 e->code_page=__get_current_lc_ctype_code_page_modified();
    set_ptrs(ds, &e->hdr, (void*)e->str, NULL);
}

// c is a unicode 32 bit codepoint
void d2d_fillcodepoint(struct d2d_draw_seq* ds, unsigned long c, double x, double y) {
    struct d2dins_fillcodepoint* e= twr_cache_malloc(sizeof(struct d2dins_fillcodepoint));
    e->hdr.type=D2D_FILLCODEPOINT;
    e->x=x;
    e->y=y;
    e->c=c;
   //twr_conlog("C: d2d_char %d %d %d",e->x, e->y, e->c);
    set_ptrs(ds, &e->hdr, NULL, NULL);  
}

void d2d_stroketext(struct d2d_draw_seq* ds, const char* str, double x, double y) {
    struct d2dins_stroketext* r = twr_cache_malloc(sizeof(struct d2dins_stroketext));
    r->hdr.type=D2D_STROKETEXT;
    r->x=x;
    r->y=y;
    r->str=cache_strdup(str);
    r->code_page=__get_current_lc_ctype_code_page_modified();
    set_ptrs(ds, &r->hdr, (void*)r->str, NULL);
}

// causes a flush so that a result is returned in *tm
// since it immediately flushes, it doesn't need to duplicate the input str
void d2d_measuretext(struct d2d_draw_seq* ds, const char* str, struct d2d_text_metrics *tm) {
    struct d2dins_measuretext* e= twr_cache_malloc(sizeof(struct d2dins_measuretext));

    e->hdr.type=D2D_MEASURETEXT;
    e->str=str;
    e->tm=tm;
	 e->code_page=__get_current_lc_ctype_code_page_modified();
    set_ptrs(ds, &e->hdr, NULL, NULL);  
    d2d_flush(ds);
}

//needs to be static or flushed before mem goes out of scope
void d2d_ctoimagedata(struct d2d_draw_seq* ds, long id, void* mem, unsigned long length, unsigned long width, unsigned long height) {
     struct d2dins_c_to_image_data* e= twr_cache_malloc(sizeof(struct d2dins_c_to_image_data));
    e->hdr.type=D2D_IMAGEDATA;
    e->start=mem-(void*)0;
    e->length=length;
    e->width=width;
    e->height=height;
    e->id=id;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

//depreciated used d2d_ctoimagedata instead
void d2d_imagedata(struct d2d_draw_seq* ds, long id, void* mem, unsigned long length, unsigned long width, unsigned long height) {
   d2d_ctoimagedata(ds, id, mem, length, width, height);
}


void d2d_putimagedata(struct d2d_draw_seq* ds, long id, unsigned long dx, unsigned long dy) {
    d2d_putimagedatadirty(ds, id, dx, dy, 0, 0, 0, 0);
}

void d2d_putimagedatadirty(struct d2d_draw_seq* ds, long id, unsigned long dx, unsigned long dy, unsigned long dirtyX, unsigned long dirtyY, unsigned long dirtyWidth, unsigned long dirtyHeight) {
    struct d2dins_put_image_data* e= twr_cache_malloc(sizeof(struct d2dins_put_image_data));
    e->hdr.type=D2D_PUTIMAGEDATA;
    assert(sizeof(void*)==4);  // ensure 32 bit architecture, 64 bit not supported 
    e->id=id; 
    e->dx=dx;
    e->dy=dy;
    e->dirtyX=dirtyX;
    e->dirtyY=dirtyY;
    e->dirtyWidth=dirtyWidth;
    e->dirtyHeight=dirtyHeight;
    set_ptrs(ds, &e->hdr, NULL, NULL);
}

void d2d_createradialgradient(struct d2d_draw_seq* ds, long id, double x0, double y0, double radius0, double x1, double y1, double radius1) {
    struct d2dins_create_radial_gradient* e= twr_cache_malloc(sizeof(struct d2dins_create_radial_gradient));
    e->hdr.type=D2D_CREATERADIALGRADIENT;
    e->id=id;
    e->x0=x0;
    e->y0=y0;
    e->radius0=radius0;
    e->x1=x1;
    e->y1=y1;
    e->radius1=radius1;
    set_ptrs(ds, &e->hdr, NULL, NULL);    
}

void d2d_createlineargradient(struct d2d_draw_seq* ds, long id, double x0, double y0, double x1, double y1) {
    struct d2dins_create_linear_gradient* e= twr_cache_malloc(sizeof(struct d2dins_create_linear_gradient));
    e->hdr.type=D2D_CREATELINEARGRADIENT;
    e->id=id;
    e->x0=x0;
    e->y0=y0;
    e->x1=x1;
    e->y1=y1;
    set_ptrs(ds, &e->hdr, NULL, NULL);    
}

void d2d_addcolorstop(struct d2d_draw_seq* ds, long gradid, long position, const char* csscolor) {
    struct d2dins_set_color_stop* e= twr_cache_malloc(sizeof(struct d2dins_set_color_stop));
    e->hdr.type=D2D_SETCOLORSTOP;
    e->id=gradid;
    e->position=position;
    e->csscolor=cache_strdup(csscolor);
    set_ptrs(ds, &e->hdr, (void*)e->csscolor, NULL); 
}

void d2d_setfillstylegradient(struct d2d_draw_seq* ds, long gradid) {
    struct d2dins_set_fillstyle_gradient* e= twr_cache_malloc(sizeof(struct d2dins_set_fillstyle_gradient));
    e->hdr.type=D2D_SETFILLSTYLEGRADIENT;
    e->id=gradid;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_releaseid(struct d2d_draw_seq* ds, long id) {
    struct d2dins_release_id* e= twr_cache_malloc(sizeof(struct d2dins_release_id));
    e->hdr.type=D2D_RELEASEID;
    e->id=id;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_closepath(struct d2d_draw_seq* ds) {
    struct d2dins_closepath* e= twr_cache_malloc(sizeof(struct d2dins_closepath));
    e->hdr.type=D2D_CLOSEPATH;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_reset(struct d2d_draw_seq* ds) {
    invalidate_cache(ds);
    struct d2dins_reset* e= twr_cache_malloc(sizeof(struct d2dins_reset));
    e->hdr.type=D2D_RESET;
    set_ptrs(ds, &e->hdr, NULL, NULL); 
}

void d2d_clearrect(struct d2d_draw_seq* ds, double x, double y, double w, double h) {
    struct d2dins_clearrect* r= twr_cache_malloc(sizeof(struct d2dins_clearrect));
    r->hdr.type=D2D_CLEARRECT;
    r->x=x;
    r->y=y;
    r->w=w;
    r->h=h;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_scale(struct d2d_draw_seq* ds, double x, double y) {
    struct d2dins_scale* r= twr_cache_malloc(sizeof(struct d2dins_scale));
    r->hdr.type=D2D_SCALE;
    r->x=x;
    r->y=y;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_translate(struct d2d_draw_seq* ds, double x, double y) {
    struct d2dins_translate* r= twr_cache_malloc(sizeof(struct d2dins_translate));
    r->hdr.type=D2D_TRANSLATE;
    r->x=x;
    r->y=y;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_rotate(struct d2d_draw_seq* ds, double angle) {
    struct d2dins_rotate* r= twr_cache_malloc(sizeof(struct d2dins_rotate));
    r->hdr.type=D2D_ROTATE;
    r->angle=angle;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_gettransform(struct d2d_draw_seq* ds, struct d2d_2d_matrix* transform) {
    struct d2dins_gettransform* r = twr_cache_malloc(sizeof(struct d2dins_gettransform));
    r->hdr.type=D2D_GETTRANSFORM;
    r->transform = transform;
    set_ptrs(ds, &r->hdr, NULL, NULL);
    d2d_flush(ds);
}

void d2d_settransform(struct d2d_draw_seq* ds, double a, double b, double c, double d, double e, double f) {
    struct d2dins_settransform* r= twr_cache_malloc(sizeof(struct d2dins_settransform));
    r->hdr.type=D2D_SETTRANSFORM;
    r->a = a;
    r->b = b;
    r->c = c;
    r->d = d;
    r->e = e;
    r->f = f;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}
void d2d_settransformmatrix(struct d2d_draw_seq* ds, const struct d2d_2d_matrix * transform) {
    d2d_settransform(ds, transform->a, transform->b, transform->c, transform->d, transform->e, transform->f);
}

void d2d_resettransform(struct d2d_draw_seq* ds) {
    struct d2dins_resettransform* r = twr_cache_malloc(sizeof(struct d2dins_resettransform));
    r->hdr.type=D2D_RESETTRANSFORM;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_roundrect(struct d2d_draw_seq* ds, double x, double y, double width, double height, double radii) {
    struct d2dins_roundrect* r = twr_cache_malloc(sizeof(struct d2dins_roundrect));
    r->hdr.type=D2D_ROUNDRECT;
    r->x = x;
    r->y = y;
    r->width = width;
    r->height = height;
    r->radii = radii;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_ellipse(struct d2d_draw_seq* ds, double x, double y, double radiusX, double radiusY, double rotation, double startAngle, double endAngle, bool counterclockwise) {
    struct d2dins_ellipse* r = twr_cache_malloc(sizeof(struct d2dins_ellipse));
    r->hdr.type = D2D_ELLIPSE;
    r->x = x;
    r->y = y;
    r->radiusX = radiusX;
    r->radiusY = radiusY;
    r->rotation = rotation;
    r->startAngle = startAngle;
    r->endAngle = endAngle;
    r->counterclockwise = counterclockwise;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_quadraticcurveto(struct d2d_draw_seq* ds, double cpx, double cpy, double x, double y) {
    struct d2dins_quadraticcurveto* r = twr_cache_malloc(sizeof(struct d2dins_quadraticcurveto));
    r->hdr.type = D2D_QUADRATICCURVETO;
    r->cpx = cpx;
    r->cpy = cpy;
    r->x = x;
    r->y = y;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_setlinedash(struct d2d_draw_seq* ds, unsigned long len, const double* segments) {
    struct d2dins_setlinedash* r = twr_cache_malloc(sizeof(struct d2dins_setlinedash));
    r->hdr.type = D2D_SETLINEDASH;
    r->segment_len = len;
    r->segments = NULL;
    if (len > 0) {
        r->segments = twr_cache_malloc(sizeof(double) * len);

        for (int i = 0; i < len; i++) {
            r->segments[i] = segments[i];
        }
    }
    set_ptrs(ds, &r->hdr, (void*)r->segments, NULL);
}

unsigned long d2d_getlinedash(struct d2d_draw_seq* ds, unsigned long length, double* buffer) {
    struct d2dins_getlinedash* r = twr_cache_malloc(sizeof(struct d2dins_getlinedash));
    r->hdr.type = D2D_GETLINEDASH;
    r->buffer = buffer;
    r->buffer_length = length;
    set_ptrs(ds, &r->hdr, NULL, NULL);
    d2d_flush(ds);
    return r->segment_length;
}

void d2d_arcto(struct d2d_draw_seq* ds, double x1, double y1, double x2, double y2, double radius) {
    struct d2dins_arcto* r = twr_cache_malloc(sizeof(struct d2dins_arcto));
    r->hdr.type = D2D_ARCTO;
    r->x1 = x1;
    r->y1 = y1;
    r->x2 = x2;
    r->y2 = y2;
    r->radius = radius;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

unsigned long d2d_getlinedashlength(struct d2d_draw_seq* ds) {
    struct d2dins_getlinedashlength* r = twr_cache_malloc(sizeof(struct d2dins_getlinedashlength));
    r->hdr.type = D2D_GETLINEDASHLENGTH;
    set_ptrs(ds, &r->hdr, NULL, NULL);
    d2d_flush(ds);
    return r->length;
}

bool d2d_load_image(const char* url, long id) {
    return d2d_load_image_with_con(url, id, twr_get_std2d_con());
}
bool d2d_load_image_with_con(const char* url, long id, twr_ioconsole_t * con) {
    return twrConLoadImage(__twr_get_jsid(con), url, id);
}

void d2d_drawimage_ex(struct d2d_draw_seq* ds, long id, double sx, double sy, double sWidth, double sHeight, double dx, double dy, double dWidth, double dHeight) {
    struct d2dins_drawimage* r = twr_cache_malloc(sizeof(struct d2dins_drawimage));
    r->hdr.type = D2D_DRAWIMAGE;
    r->id = id;
    r->sx = sx;
    r->sy = sy;
    r->sWidth = sWidth;
    r->sHeight = sHeight;
    r->dx = dx;
    r->dy = dy;
    r->dHeight = dHeight;
    r->dWidth = dWidth;

    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_drawimage(struct d2d_draw_seq* ds, long id, double dx, double dy) {
   d2d_drawimage_ex(ds, id, 0, 0, 0, 0, dx, dy, 0, 0);
}

void d2d_rect(struct d2d_draw_seq* ds, double x, double y, double width, double height) {
    struct d2dins_rect* r = twr_cache_malloc(sizeof(struct d2dins_rect));
    r->hdr.type = D2D_RECT;
    r->x = x;
    r->y = y;
    r->width = width;
    r->height = height;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_transform(struct d2d_draw_seq* ds, double a, double b, double c, double d, double e, double f) {
    struct d2dins_transform* r = twr_cache_malloc(sizeof(struct d2dins_transform));
    r->hdr.type = D2D_TRANSFORM;
    r->a = a;
    r->b = b;
    r->c = c;
    r->d = d;
    r->e = e;
    r->f = f;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}
void d2d_transformmatrix(struct d2d_draw_seq* ds, const struct d2d_2d_matrix * transform) {
    d2d_transform(ds, transform->a, transform->b, transform->c, transform->d, transform->e, transform->f);
}

void d2d_setlinecap(struct d2d_draw_seq* ds, const char* line_cap) {
    struct d2dins_setlinecap* r = twr_cache_malloc(sizeof(struct d2dins_setlinecap));
    r->hdr.type = D2D_SETLINECAP;
    r->line_cap = cache_strdup(line_cap);
    set_ptrs(ds, &r->hdr, (void*)r->line_cap, NULL);
}

void d2d_setlinejoin(struct d2d_draw_seq* ds, const char* line_join) {
    struct d2dins_setlinejoin* r = twr_cache_malloc(sizeof(struct d2dins_setlinejoin));
    r->hdr.type = D2D_SETLINEJOIN;
    r->line_join = cache_strdup(line_join);
    set_ptrs(ds, &r->hdr, (void*)r->line_join, NULL);
}

void d2d_setlinedashoffset(struct d2d_draw_seq* ds, double line_dash_offset) {
    struct d2dins_setlinedashoffset* r = twr_cache_malloc(sizeof(struct d2dins_setlinedashoffset));
    r->hdr.type = D2D_SETLINEDASHOFFSET;
    r->line_dash_offset = line_dash_offset;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

void d2d_getimagedata(struct d2d_draw_seq* ds, long id, double x, double y, double width, double height) {
    struct d2dins_getimagedata* r = twr_cache_malloc(sizeof(struct d2dins_getimagedata));
    r->hdr.type = D2D_GETIMAGEDATA;
    r->x = x;
    r->y = y;
    r->width = width;
    r->height = height;
    r->id = id;
    set_ptrs(ds, &r->hdr, NULL, NULL);
}

unsigned long d2d_getimagedatasize(double width, double height) {
    const double colors_per_pixel = 4; //RGBA
    const double bytes_per_color = 1; //1 Byte per color (0-255)

    const double bytes_per_pixel = colors_per_pixel * bytes_per_color;
    double pixels = width * height;
    double bytes = pixels * bytes_per_pixel;
    return (unsigned long)ceil(bytes);
}

void d2d_imagedatatoc(struct d2d_draw_seq* ds, long id, void* buffer, unsigned long buffer_len) {
   struct d2dins_imagedatatoc* r = twr_cache_malloc(sizeof(struct d2dins_imagedatatoc));
   r->hdr.type = D2D_IMAGEDATATOC;
   r->id = id;
   r->buffer = buffer;
   r->buffer_len = buffer_len;
   set_ptrs(ds, &r->hdr, NULL, NULL);
   d2d_flush(ds);
}

double d2d_getcanvaspropdouble(struct d2d_draw_seq* ds, const char* prop_name) {
   struct d2dins_getcanvaspropdouble* r = twr_cache_malloc(sizeof(struct d2dins_getcanvaspropdouble));
   r->hdr.type = D2D_GETCANVASPROPDOUBLE;
   r->prop_name = prop_name;
   double ret_val;
   r->val = &ret_val;
   set_ptrs(ds, &r->hdr, NULL, NULL);
   d2d_flush(ds);
   return ret_val;
}
void d2d_getcanvaspropstring(struct d2d_draw_seq* ds, const char* prop_name, char* buffer, unsigned long buffer_len) {
   struct d2dins_getcanvaspropstring* r = twr_cache_malloc(sizeof(struct d2dins_getcanvaspropstring));
   r->hdr.type = D2D_GETCANVASPROPSTRING;
   r->prop_name = prop_name;
   r->val = buffer;
   r->max_len = buffer_len;
   set_ptrs(ds, &r->hdr, NULL, NULL);
   d2d_flush(ds);
}
void d2d_setcanvaspropdouble(struct d2d_draw_seq* ds, const char* prop_name, double val) {
   struct d2dins_setcanvaspropdouble* r = twr_cache_malloc(sizeof(struct d2dins_setcanvaspropdouble));
   r->hdr.type = D2D_SETCANVASPROPDOUBLE;
   r->prop_name = cache_strdup(prop_name);
   r->val = val;
   set_ptrs(ds, &r->hdr, (void*)r->prop_name, NULL);
}
void d2d_setcanvaspropstring(struct d2d_draw_seq* ds, const char* prop_name, const char* val) {
   struct d2dins_setcanvaspropstring* r = twr_cache_malloc(sizeof(struct d2dins_setcanvaspropstring));
   r->hdr.type = D2D_SETCANVASPROPSTRING;
   r->prop_name = cache_strdup(prop_name);
   r->val = cache_strdup(val);

   set_ptrs(ds, &r->hdr, (void*)r->prop_name, (void*)r->val);
}
#ifndef TWR_CPP_CANVAS_H
#define TWR_CPP_CANVAS_H

#include <stddef.h>
#include "twr-draw2d.h"

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


typedef unsigned long colorRGB_t;
typedef unsigned long colorRGBA_t;

#define CSSCLR_BLUE20 0x72AEE6
#define CSSCLR_WHITE  0xFFFFFF
#define CSSCLR_BLACK  0x000000
#define CSSCLR_GRAY10 0xC3C4C7
#define CSSCLR_GRAY5  0xDCDCDE

class twrCanvas {
  public:
    twrCanvas();
    
    void startDrawSequence(int n=1000);
    void endDrawSequence();
    void flush();

    void beginPath();
    void arc(double x, double y, double radius, double startAngle, double endAngle, bool counterclockwise);
    void arcTo(double x1, double y1, double x2, double y2, double radius);
    void moveTo(double x, double y);
    void lineTo(double x, double y);
    void bezierCurveTo(double cp1x, double cp1y, double cp2x, double cp2y, double x, double y);
    void fill();
    void stroke();
    void roundRect(double x, double y, double width, double height, double radii);
    void ellipse(double x, double y, double radiusX, double radiusY, double rotation, double startAngle, double endAngle, bool counterclockwise = false);
    void quadraticCurveTo(double cpx, double cpy, double x, double y);
    void rect(double x, double y, double width, double height);
    void closePath();

    void save();
    void restore();
    void measureText(const char* str, struct d2d_text_metrics *tm);

    void setFillStyleRGB(colorRGB_t color);
    void setStrokeStyleRGB(colorRGB_t color);
    void setFillStyleRGBA(colorRGBA_t color);
    void setStrokeStyleRGBA(colorRGBA_t color);
    void setFillStyle(const char* cssColor);
    void setStrokeStyle(const char* cssColor);
    void setLineWidth(double width);
    void setFont(const char* str);
    void setLineCap(const char* str);
    void setLineJoin(const char* str);
    void setLineDashOffset(double line_dash_offset);

    void createLinearGradient(long id, double x0, double y0, double x1, double y1);
    void createRadialGradient(long id, double x0, double y0, double radius0, double x1, double y1, double radius1);
    void addColorStop(long gradID, long position, const char* color);
    void setFillStyleGradient(long gradID);
    void releaseID(long id);

    void fillRect(double x, double y, double w, double h);
    void strokeRect(double x, double y, double w, double h);
    void fillText(const char* str, double x, double y);
    void fillCodePoint(unsigned long c, double x, double y);
    void strokeText(const char* str, double x, double y);
   
    //depreciated used cToImageData instead
    void imageData(long id, void* mem, unsigned long length, unsigned long width, unsigned long height);
    void imageDataToC(long id, void* mem, unsigned long length, unsigned long width, unsigned long height);
    void putImageData(long id, unsigned long dx, unsigned long dy);
    void putImageData(long id, unsigned long dx, unsigned long dy, unsigned long dirtyX, unsigned long dirtyY, unsigned long dirtyWidth, unsigned long dirtyHeight);

    void reset();
    void clearRect(double x, double y, double w, double h);
    void scale(double x, double y);
    void translate(double x, double y);
    void rotate(double angle);
    void getTransform(d2d_2d_matrix * transform);
    void setTransform(double a, double b, double c, double d, double e, double f);
    void setTransform(const d2d_2d_matrix * transform);
    void transform(double a, double b, double c, double d, double e, double f);
    void transform(const d2d_2d_matrix * transform);
    void resetTransform();
    void setLineDash(unsigned long len, const double* segments);
    unsigned long getLineDash(unsigned long length, double* buffer);
    unsigned long getLineDashLength();

    void drawImage(long id, double dx, double dy);
    void drawImage(long id, double sx, double sy, double sWidth, double sHeight, double dx, double dy, double dWidth, double dHeight);
    void getImageData(long id, double x, double y, double width, double height);
    unsigned long getImageDataSize(double width, double height);
    void imageDataToC(long id, void* buffer, unsigned long buffer_len);

    double getCanvasPropDouble(const char* prop_name);
    void getCanvasPropString(const char* prop_name, char* buffer, unsigned long buffer_len);
    void setCanvasPropDouble(const char* prop_name, double val);
   void setCanvasPropString(const char* prop_name, const char* val);

private:
  struct d2d_draw_seq *m_ds;

};

#endif
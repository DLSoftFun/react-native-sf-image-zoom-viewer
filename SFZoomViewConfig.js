
export default class SFZoomViewConfig{

    //默认图片间距
    static img_dis = 10;
    //移动的速度超过多少会更换图片 (0~1.0)
    static max_speed_x = 0.5;
    //移动的距离超过多少会更换图片
    static max_move_x = 100;

    //显示图片的动画时间
    static show_duration = 300;

    //是否显示分享按钮
    static is_show_share = true;
    //是否开启显示和隐藏动画
    static is_show_ani = true;

    //展示图片的类型
    static ZOOM_TYPE_IMG = 0
    static ZOOM_TYPE_VIDEO = 1
    static ZOOM_TYPE_GIF = 2
    static ZOOM_TYPE_LONG_IMG = 3

}


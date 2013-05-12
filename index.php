<?php 
/*
Plugin Name: 读者墙气泡屏保
Plugin URI: http://wange.im/wg-bubble.html
Description: 给你的 WordPress 加个彩蛋，模拟 Windows 气泡屏幕保护，显示最近评论数量最多的访客头像，支持 IE9 / Chrome / Firefox / Opera 等浏览器，可配置等待时间、气泡半径以及气泡数量等。
Author: WanGe
Version: 2.1
Author URI: http://wange.im
*/

$wg_bubble = '读者墙气泡屏保';
$wb = 'wg_bubble';
$wb_version = '2.0';
$wait_arr = array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);       // 等待时间选项
$radius_arr = array(40, 50, 60, 70, 80, 90, 100);       // 气泡半径选项
$num_arr = array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);       // 气泡数量选项
$date_arr = array('一周内', '一月内', '一季度内', '一年内');           // 时间范围选项

$wait_default = $wait_arr[0];   // 默认等待时间
$radius_default = $radius_arr[3];   // 默认气泡半径
$num_default = $num_arr[6];   // 默认气泡数量
$date_default = $date_arr[1];   // 默认时间范围

$wb_options = array (
    array('name' => '等待时间（单位：分钟）','id' => $wb.'_wait','std' => $wait_default,'type' => 'select','options' => $wait_arr),
    array('name' => '气泡半径（单位：像素）','id' => $wb.'_radius','std' => $radius_default,'type' => 'select','options' => $radius_arr),
    array('name' => '气泡数量（单位：个）','id' => $wb.'_num','std' => $num_default,'type' => 'select','options' => $num_arr),
    array('name' => '评论数量排行时间范围', 'id' => $wb.'_date', 'std' => $date_default, 'type' => 'select', 'options' => $date_arr)
);
function wg_bubble_add_admin() {
    global $wg_bubble, $wb, $wb_options;
    if ( $_GET['page'] == basename(__FILE__) ) {
        if ( 'save' == $_REQUEST['action'] ) {
            foreach ($wb_options as $value) {
                update_option( $value['id'], $_REQUEST[ $value['id'] ] );
            }
            foreach ($wb_options as $value) {
                if( isset( $_REQUEST[ $value['id'] ] ) ) {
                    update_option( $value['id'], $_REQUEST[ $value['id'] ]  ); 
                } else {
                    delete_option( $value['id'] );
                }
            }
            header("Location: themes.php?page=index.php&saved=true");
            die;
        } elseif( 'reset' == $_REQUEST['action'] ) {
            foreach ($wb_options as $value) {
                delete_option( $value['id'] ); 
                update_option( $value['id'], $value['std'] );
            }
            header("Location: themes.php?page=index.php&reset=true");
            die;
        }
    }
    add_theme_page($wg_bubble, $wg_bubble, 'edit_themes', basename(__FILE__), 'wg_bubble_admin');
}
function wg_bubble_admin() {
    global $wg_bubble, $wb, $wb_options;
    if ( $_REQUEST['saved'] ) echo '<div class="updated"><p><strong>设置已保存</strong></p></div>';
    if ( $_REQUEST['reset'] ) echo '<div class="updated"><p><strong>设置已重置</strong></p></div>';
?>
    <style type="text/css">
        .form-table th{vertical-align:middle;}
    </style>
    <div class="wrap">
        <?php screen_icon(); ?>
        <h2><?php echo $wg_bubble; ?></h2>
        <form method="post">
            <table class="form-table" >
                <?php 
                foreach ($wb_options as $value) { 
                    if ($value['type'] == "select") { ?>
                        <tr> 
                            <th><strong><?php echo $value['name']; ?>:</strong></th>
                            <td>
                                <select style="font-size:12px" name="<?php echo $value['id']; ?>" id="<?php echo $value['id']; ?>">
                                <?php foreach ($value['options'] as $option) { ?>
                                <option<?php if ( get_settings( $value['id'] ) == $option) { echo ' selected="selected"'; }?>><?php echo $option; ?></option>
                                <?php } ?>
                                </select>
                            </td>
                        </tr>
                    <?php }
                }
                ?>
            </table>
            <div class="submit">
                <input class="button-primary" name="save" type="submit" value="保存设置" />    
                <input type="hidden" name="action" value="save" />
            </div>
        </form>
        <form method="post" class="defaultbutton">
            <div class="submit">
                <input class="button-secondary" name="reset" type="submit" value="重置设置" />
                <input type="hidden" name="action" value="reset" />
            </div>
        </form>
    </div>
    <?php
}
add_action('admin_menu', 'wg_bubble_add_admin');

function wange_bubble() {
    global $wpdb,
           $wait_default, 
           $num_default, 
           $radius_default, 
           $date_default,
           $wb_version;
           
    $wb_wait = get_option('wg_bubble_wait') ? get_option('wg_bubble_wait') * 1000 * 60 : $wait_default * 1000 * 60;
    $wb_num = get_option('wg_bubble_num') ? get_option('wg_bubble_num') : $num_default;
    $wb_radius = get_option('wg_bubble_radius') ? get_option('wg_bubble_radius') : $radius_default;
    $wb_cmt_date = get_option('wg_bubble_date') ? get_option('wg_bubble_date') : $date_default;
    
    
    switch($wb_cmt_date) {
        case '一周内':
            $wb_cmt_range = date('Y-m-d H:i:s', strtotime('-1 week'));
        break;
        
        case '一月内':
            $wb_cmt_range = date('Y-m-d H:i:s', strtotime('-1 Month'));
        break;
        
        case '一季度内':
            $wb_cmt_range = date('Y-m-d H:i:s', strtotime('-3 Month'));
        break;
        
        case '一年内':
            $wb_cmt_range = date('Y-m-d H:i:s', strtotime('-1 Year'));
        break;
        
        default:
            $wb_cmt_range = date('Y-m-d H:i:s', strtotime('-1 Year'));
        break;
    }
    
    $results = $wpdb->get_results("SELECT COUNT(comment_author) AS cnt, comment_author, comment_author_url,comment_author_email FROM (SELECT * FROM $wpdb->comments LEFT OUTER JOIN $wpdb->posts ON ($wpdb->posts.ID=$wpdb->comments.comment_post_ID) WHERE comment_date>'" . $wb_cmt_range . "' AND user_id='0' AND post_password='' AND comment_approved='1') AS tempcmt GROUP BY comment_author ORDER BY cnt DESC LIMIT " . $wb_num);
    $counts = count($results);

    if ( $counts !== 0) {
        $output = '';
        if ( $results ) : foreach ($results as $key => $count) :
            $prefix = '{';
            $suffix = $key !== $counts - 1 ? '},' : '}';
            $output .= $prefix.
                       '    src: "http://www.gravatar.com/avatar/' . md5(strtolower( $count->comment_author_email )) . '?s=' . $wb_radius*2 . '",' .
                       '    url: "' .$count->comment_author_url . '",' .
                       '    name: "' . $count->comment_author . '"' .
                       $suffix;
        endforeach; endif;

        echo '<script type="text/javascript">'.
             'window.addEventListener && window.addEventListener("load", function() {' .
             '    new Bubble().init({' .
             '        wait: ' . $wb_wait . ',' .
             '        radius: ' . $wb_radius . ',' .
             '        avatar: [' .
                            $output .
             '        ]' .
             '    });' .
             '});' .
             '</script>';
        wp_enqueue_script('wg-bubble', plugins_url('wg-bubble') . '/bubble.js', false, $wb_version, true);
    }
}
add_action('wp_footer', 'wange_bubble');
?>

<?php 
/*
Plugin Name: 万戈牌气泡屏保
Plugin URI: http://wange.im/wg-bubble.html
Description: 给你的 WordPress 加个彩蛋，模拟 Windows 气泡屏幕保护，支持 IE9 / Chrome / Firefox / Opera 等浏览器，可配置等待时间、气泡半径以及气泡数量。不求好用，但求好玩 :-)
Author: 万戈
Version: 1.1
Author URI: http://wange.im
*/

$wg_bubble = '万戈牌气泡屏保';
$wb = 'wg_bubble';
$wb_version = '1.1';
$wait_arr = array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);       // 等待时间选项
$radius_arr = array(10, 20, 30, 40, 50, 60, 70, 80, 90, 100);       // 气泡半径选项
$num_arr = array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);       // 气泡数量选项

$wait_default = $wait_arr[0];   // 默认等待时间
$radius_default = $radius_arr[8];   // 默认气泡半径
$num_default = $num_arr[9];   // 默认气泡数量

$wb_options = array (
    array('name' => '等待时间（单位：分钟）','id' => $wb.'_wait','std' => $wait_default,'type' => 'select','options' => $wait_arr),
    array('name' => '气泡半径（单位：像素）','id' => $wb.'_radius','std' => $radius_default,'type' => 'select','options' => $radius_arr),
    array('name' => '气泡数量（单位：个）','id' => $wb.'_num','std' => $num_default,'type' => 'select','options' => $num_arr)
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
    global $wait_default, $num_default, $radius_default, $wb_version;
    $wb_wait = get_option('wg_bubble_wait') ? get_option('wg_bubble_wait') * 1000 * 60 : $wait_default;
    $wb_num = get_option('wg_bubble_num') ? get_option('wg_bubble_num') : $num_default;
    $wb_radius = get_option('wg_bubble_radius') ? get_option('wg_bubble_radius') : $radius_default;
    
    echo '<script type="text/javascript">window.addEventListener && window.addEventListener("load", function() {new Bubble().init({wait: ' . $wb_wait . ', num: ' . $wb_num . ', radius: ' . $wb_radius . '})});</script>';
    wp_enqueue_script('wg-bubble', plugins_url('wg-bubble') . '/bubble.js', false, $wb_version, true);
}
add_action('wp_footer', 'wange_bubble');
?>
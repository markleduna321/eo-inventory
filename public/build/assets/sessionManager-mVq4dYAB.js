class i{constructor(){this.sessionTimeout=null,this.warningTimeout=null,this.checkInterval=null,this.sessionLifetime=480*60*1e3,this.warningTime=5*60*1e3,this.lastActivity=Date.now(),this.init()}init(){this.trackActivity(),this.startSessionMonitoring(),this.handleVisibilityChange()}trackActivity(){["mousedown","mousemove","keypress","scroll","touchstart","click"].forEach(t=>{document.addEventListener(t,()=>{this.updateLastActivity()},{passive:!0})})}updateLastActivity(){this.lastActivity=Date.now(),this.resetTimers(),this.startSessionMonitoring()}startSessionMonitoring(){this.resetTimers(),this.warningTimeout=setTimeout(()=>{this.showSessionWarning()},this.sessionLifetime-this.warningTime),this.sessionTimeout=setTimeout(()=>{this.handleSessionExpiration()},this.sessionLifetime),this.checkInterval=setInterval(()=>{this.checkServerSession()},5*60*1e3)}resetTimers(){this.sessionTimeout&&clearTimeout(this.sessionTimeout),this.warningTimeout&&clearTimeout(this.warningTimeout),this.checkInterval&&clearInterval(this.checkInterval)}showSessionWarning(){this.shouldShowWarning()&&this.createWarningModal()}shouldShowWarning(){return document.visibilityState==="visible"&&Date.now()-this.lastActivity<this.warningTime}createWarningModal(){const e=document.getElementById("session-warning-modal");e&&e.remove();const t=document.createElement("div");t.id="session-warning-modal",t.className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50",t.innerHTML=`
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div class="flex items-center mb-4">
                    <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 class="ml-3 text-lg font-medium text-gray-900">Session Expiring Soon</h3>
                </div>
                <p class="text-gray-600 mb-6">
                    Your session will expire in 5 minutes due to inactivity. Click "Stay Logged In" to continue your session.
                </p>
                <div class="flex justify-end space-x-3">
                    <button id="logout-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                        Log Out
                    </button>
                    <button id="stay-logged-btn" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                        Stay Logged In
                    </button>
                </div>
            </div>
        `,document.body.appendChild(t),document.getElementById("stay-logged-btn").addEventListener("click",()=>{this.extendSession(),t.remove()}),document.getElementById("logout-btn").addEventListener("click",()=>{this.logout()})}extendSession(){var e;fetch("/api/extend-session",{method:"POST",headers:{"Content-Type":"application/json","X-CSRF-TOKEN":(e=document.querySelector('meta[name="csrf-token"]'))==null?void 0:e.getAttribute("content")}}).then(t=>{t.ok?this.updateLastActivity():this.handleSessionExpiration()}).catch(()=>{this.handleSessionExpiration()})}handleSessionExpiration(){this.resetTimers();const e=document.getElementById("session-warning-modal");e&&e.remove(),this.showExpirationNotice(),setTimeout(()=>{this.logout()},3e3)}showExpirationNotice(){const e=document.createElement("div");e.className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm",e.innerHTML=`
            <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p class="font-medium">Session Expired</p>
                    <p class="text-sm">You will be redirected to login...</p>
                </div>
            </div>
        `,document.body.appendChild(e),setTimeout(()=>{e.remove()},3e3)}checkServerSession(){fetch("/api/session-status",{method:"GET",headers:{"X-Requested-With":"XMLHttpRequest"}}).then(e=>{e.status===401&&this.handleSessionExpiration()}).catch(()=>{})}handleVisibilityChange(){document.addEventListener("visibilitychange",()=>{document.visibilityState==="visible"&&this.checkServerSession()})}logout(){this.resetTimers(),window.location.href="/logout"}destroy(){this.resetTimers()}}document.addEventListener("DOMContentLoaded",()=>{document.querySelector('meta[name="user-authenticated"]')&&(window.sessionManager=new i)});window.addEventListener("beforeunload",()=>{window.sessionManager&&window.sessionManager.destroy()});export{i as default};
